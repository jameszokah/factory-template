import { cn } from '@mastra/playground-ui/utils/cn';

import { brand } from '.';

/** Your logo, from `brand.json`. Replace `public/brand/logo.svg` (or point `logo` elsewhere) to change it. */
export function BrandLogo({ className, decorative = true }: { className?: string; decorative?: boolean }) {
  return (
    <img
      src={brand.logo}
      alt={decorative ? '' : brand.name}
      aria-hidden={decorative || undefined}
      className={cn('size-6 shrink-0', className)}
    />
  );
}
