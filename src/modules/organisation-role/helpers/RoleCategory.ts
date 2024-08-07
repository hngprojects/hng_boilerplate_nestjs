export enum RoleCategory {
  User = 'User',
  Administrator = 'Administrator',
}

export const RoleCategoryDescriptions: { [key in RoleCategory]: string } = {
  [RoleCategory.User]: 'A regular user with standard permissions.',
  [RoleCategory.Administrator]: 'An administrator with full access and permissions.',
};
