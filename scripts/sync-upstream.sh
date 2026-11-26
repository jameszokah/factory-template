#!/usr/bin/env bash
# Pull upstream Factory UI changes into apps/ui while keeping your edits.
#
#   scripts/sync-upstream.sh @mastra/factory@0.32.0
#
# Diffs mastracode/factory-ui between the commit in UPSTREAM.json and the new
# release tag, applies that diff to apps/ui with a 3-way merge (conflicts are
# left as markers for you to resolve) and updates UPSTREAM.json. You then bump
# the pinned @mastra/* versions to the ones released with that tag. Commit or stash your work first.
set -euo pipefail

tag="${1:?usage: scripts/sync-upstream.sh <release tag, e.g. @mastra/factory@0.32.0>}"
root="$(cd "$(dirname "$0")/.." && pwd)"
old_commit="$(node -p "require('$root/UPSTREAM.json').commit")"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

git -C "$work" init -q
git -C "$work" remote add origin https://github.com/mastra-ai/mastra.git
git -C "$work" fetch -q --filter=blob:none --depth 1 origin "$old_commit"
git -C "$work" fetch -q --filter=blob:none --depth 1 origin "refs/tags/$tag:refs/tags/target"
new_commit="$(git -C "$work" rev-parse 'target^{commit}')"

git -C "$work" diff --binary "$old_commit" "$new_commit" -- mastracode/factory-ui \
  ':!mastracode/factory-ui/package.json' ':!mastracode/factory-ui/oxlint.config.ts' \
     ':!mastracode/factory-ui/turbo.json' ':!mastracode/factory-ui/lint-staged.config.js' \
     ':!mastracode/factory-ui/tsconfig.json' >"$work/ui.patch"

if [ -s "$work/ui.patch" ]; then
  (cd "$root" && git apply -3 -p3 --directory=apps/ui "$work/ui.patch") ||
    echo "Some hunks conflicted. Resolve the conflict markers in apps/ui, then continue."
else
  echo "No UI changes between $old_commit and $tag."
fi

node -e "
const f='$root/UPSTREAM.json';const j=require(f);
j.commit='$new_commit';j.release='$tag';
require('fs').writeFileSync(f, JSON.stringify(j,null,2)+'\n');"
echo "Applied upstream UI changes up to $tag ($new_commit)."
echo "Now bump the @mastra/* versions in apps/*/package.json to the ones released with $tag, then: bun install && bun run typecheck && bun run build"
