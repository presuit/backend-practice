import { SetMetadata } from '@nestjs/common';

enum AuthRole {
  Any = 'Any',
}

export type AllowedAuthRole = keyof typeof AuthRole;

export const Roles = (roles: AllowedAuthRole[]) => SetMetadata('roles', roles);
