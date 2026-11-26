/**
 * Integrations are enabled by their environment variables: a complete group
 * turns one on, a missing group leaves it off. Add, remove or replace entries
 * freely. See https://factory.mastra.ai/configure/github and friends.
 */
import type { FactoryIntegration } from '@mastra/factory';
import { GithubIntegration } from '@mastra/factory/integrations/github/integration';
import { GitLabIntegration } from '@mastra/factory/integrations/gitlab/integration';
import { JiraIntegration } from '@mastra/factory/integrations/jira/integration';
import { LinearIntegration } from '@mastra/factory/integrations/linear/integration';
import { SlackIntegration } from '@mastra/factory/integrations/slack/integration';

import { env } from './env';

function allSet(names: string[]): boolean {
  const set = names.filter(name => env(name));
  if (set.length > 0 && set.length < names.length) {
    const missing = names.filter(name => !env(name));
    console.warn(`[integrations] Partial configuration ignored. Missing: ${missing.join(', ')}`);
  }
  return set.length === names.length;
}

export function createIntegrations(): FactoryIntegration[] {
  const integrations: FactoryIntegration[] = [];

  // GitHub App: repository access, issue intake, pull requests, webhooks.
  if (
    allSet([
      'GITHUB_APP_ID',
      'GITHUB_APP_PRIVATE_KEY',
      'GITHUB_APP_CLIENT_ID',
      'GITHUB_APP_CLIENT_SECRET',
      'GITHUB_APP_SLUG',
    ])
  ) {
    integrations.push(
      new GithubIntegration({
        appId: env('GITHUB_APP_ID')!,
        // Accept keys pasted with literal "\n" sequences (common in .env files).
        privateKey: env('GITHUB_APP_PRIVATE_KEY')!.replace(/\\n/g, '\n'),
        clientId: env('GITHUB_APP_CLIENT_ID')!,
        clientSecret: env('GITHUB_APP_CLIENT_SECRET')!,
        slug: env('GITHUB_APP_SLUG')!,
        webhookSecret: env('GITHUB_APP_WEBHOOK_SECRET'),
      }),
    );
  }

  // GitLab (personal or group access token).
  const gitlabToken = env('GITLAB_ACCESS_TOKEN');
  if (gitlabToken) {
    const tokenType = env('GITLAB_ACCESS_TOKEN_TYPE');
    integrations.push(
      new GitLabIntegration({
        accessToken: gitlabToken,
        ...(tokenType === 'personal' || tokenType === 'group' ? { accessTokenType: tokenType } : {}),
        ...(env('GITLAB_BASE_URL') ? { baseUrl: env('GITLAB_BASE_URL') } : {}),
        ...(env('GITLAB_WEBHOOK_SECRET') ? { webhookSecret: env('GITLAB_WEBHOOK_SECRET') } : {}),
      }),
    );
  }

  // Linear OAuth app.
  if (allSet(['LINEAR_CLIENT_ID', 'LINEAR_CLIENT_SECRET'])) {
    integrations.push(
      new LinearIntegration({ clientId: env('LINEAR_CLIENT_ID')!, clientSecret: env('LINEAR_CLIENT_SECRET')! }),
    );
  }

  // Jira Cloud (basic auth with an API token).
  if (allSet(['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'])) {
    integrations.push(
      new JiraIntegration({
        baseUrl: env('JIRA_BASE_URL')!,
        ...(env('JIRA_API_BASE_URL') ? { apiBaseUrl: env('JIRA_API_BASE_URL') } : {}),
        email: env('JIRA_EMAIL')!,
        apiToken: env('JIRA_API_TOKEN')!,
      }),
    );
  }

  // Slack: Socket Mode when SLACK_APP_TOKEN is set, HTTP webhooks otherwise.
  const slackAppToken = env('SLACK_APP_TOKEN');
  const slackSigningSecret = env('SLACK_APP_SIGNING_SECRET');
  if (slackAppToken || slackSigningSecret) {
    integrations.push(
      new SlackIntegration({
        mode: slackAppToken ? 'socket' : 'webhook',
        appToken: slackAppToken,
        signingSecret: slackSigningSecret,
        botToken: env('SLACK_APP_BOT_TOKEN'),
        clientId: env('SLACK_APP_CLIENT_ID'),
        clientSecret: env('SLACK_APP_CLIENT_SECRET'),
        oidcRedirectBaseUrl: env('MASTRACODE_CHANNELS_PUBLIC_URL') ?? env('MASTRACODE_PUBLIC_URL'),
        uiOrigin: env('MASTRACODE_PUBLIC_URL'),
      }),
    );
  }

  if (integrations.length === 0) {
    console.warn('[integrations] None configured. Set the GITHUB_APP_* variables to connect repositories.');
  }
  return integrations;
}
