import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from './auth.service';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const isAuthRoute = request.url.includes('/auth/');
  const accessToken = authService.getAccessToken();

  const authenticatedRequest = !isAuthRoute && accessToken
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error) => {
      const shouldRefresh = error.status === 401 && !isAuthRoute && !request.url.includes('/auth/refresh');

      if (!shouldRefresh) {
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap((response) =>
          next(
            request.clone({
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`,
              },
            })
          )
        ),
        catchError((refreshError) => {
          authService.forceLogout();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
