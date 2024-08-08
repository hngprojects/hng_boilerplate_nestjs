import { OrganisationRole } from '../../organisation-role/entities/organisation-role.entity';
import { Permissions } from '../../organisation-permissions/entities/permissions.entity';
// 0d733c90-fbfe-4980-b983-1483e4ac224a
export class MemberRoleMapper {
  static mapToResponseFormat(orgRole: OrganisationRole) {
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
