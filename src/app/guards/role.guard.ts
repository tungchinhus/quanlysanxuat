import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const requiredRoles = route.data['roles'] as UserRole[];
    const requiredPermission = route.data['permission'] as string;

    return this.authService.currentUser.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        // Check role-based access
        if (requiredRoles && requiredRoles.length > 0) {
          if (!requiredRoles.includes((user as any).role)) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        // Check permission-based access
        if (requiredPermission) {
          if (!this.authService.hasPermission(requiredPermission)) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        return true;
      })
    );
  }
}
