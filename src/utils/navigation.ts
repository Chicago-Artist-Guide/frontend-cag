type ReloadableLocation = Pick<Location, 'reload'>;
type AssignableLocation = Pick<Location, 'assign'>;
type NavigationClick = Pick<
  MouseEvent,
  | 'altKey'
  | 'button'
  | 'ctrlKey'
  | 'defaultPrevented'
  | 'metaKey'
  | 'preventDefault'
  | 'shiftKey'
>;

// Temporary phase-1 boundary while Next App Router and the legacy
// BrowserRouter coexist. Native Next navigation is restored as routes move.
export const navigateLegacyDocument = (
  locationLike: AssignableLocation,
  href: string,
  event: NavigationClick
): void => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return;
  }

  event.preventDefault();
  locationLike.assign(href);
};

export const reloadDocument = (locationLike: ReloadableLocation): void => {
  locationLike.reload();
};
