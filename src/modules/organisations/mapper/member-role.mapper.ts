// 0d733c90-fbfe-4980-b983-1483e4ac224a
export class MemberRoleMapper {
  static mapToResponseFormat(orgRole) {
    if (!orgRole) {
      throw new Error('Organisation role entity is required');
    }
    const permissions = orgRole.permissions.map(permission => {
      if (permission.permission_list) {
        return permission.category;
      }
    });

    return {
      name: orgRole.name,
      permissions,
    };
  }
}
