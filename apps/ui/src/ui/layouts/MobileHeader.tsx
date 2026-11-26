import { Button } from '@mastra/playground-ui/components/Button';
import { Sidebar, useSidebar } from '@mastra/playground-ui/components/Sidebar';
import { Txt } from '@mastra/playground-ui/components/Txt';
import { IconMagnifyingGlass } from '@mastra/playground-ui/icons/central/IconMagnifyingGlass';

import { brand } from '../brand';
import { BrandLogo } from '../brand/BrandLogo';
import { useGlobalSearchControls } from '../domains/search/hooks/useGlobalSearchControls';

export function MobileHeader() {
  const { isMobile } = useSidebar();
  const { openSearch } = useGlobalSearchControls();
  if (!isMobile) return null;

  return (
    <header className="border-border bg-sidebar sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between gap-3 border-b px-3">
      <div className="flex min-w-0 items-center gap-3">
        <Sidebar.MobileTrigger id="mobile-navigation-trigger" className="shrink-0" />
        <span className="flex min-w-0 items-center gap-2">
          <BrandLogo className="size-[1.5rem]" />
          <Txt as="span" variant="body-sm" font="display" className="whitespace-nowrap">
            {brand.name}
          </Txt>
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-md"
        tooltip="Search"
        aria-label="Search and navigate"
        onClick={event => openSearch(event.currentTarget)}
        className="shrink-0"
      >
        <IconMagnifyingGlass />
      </Button>
    </header>
  );
}
