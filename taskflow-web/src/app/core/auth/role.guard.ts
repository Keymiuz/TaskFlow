import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthService } from './auth.service';
import { UserRole } from '../models/auth.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] as readonly UserRole[] | undefined) ?? [];

  if (roles.length === 0) {
    return true;
  }

  return authService.hasAnyRole(roles) ? true : router.createUrlTree(['/dashboard']);
};
