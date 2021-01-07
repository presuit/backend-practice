import { SetMetadata } from '@nestjs/common';

export type AuthRole = 'Any' | 'Seller';

export const Roles = (roles: AuthRole[]) => SetMetadata('roles', roles);
