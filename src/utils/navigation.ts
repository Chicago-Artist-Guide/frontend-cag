type ReloadableLocation = Pick<Location, 'reload'>;

export const reloadDocument = (locationLike: ReloadableLocation): void => {
  locationLike.reload();
};
