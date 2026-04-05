import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, switchMap, throwError, BehaviorSubject } from 'rxjs';
import { AdminLoginDto, AdminAuthResponseDto } from '../models/admin-auth.model';

const STORAGE_KEYS = {
  TOKEN: 'admin_token',
  REFRESH_TOKEN: 'admin_refresh_token',
  EXPIRES_AT: 'admin_expires_at',
  ADMIN_ID: 'admin_id',
  FULL_NAME: 'admin_full_name',
  EMAIL: 'admin_email',
  ROLE: 'admin_role'
} as const;

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly baseUrl = 'http://localhost:7000/api/admin-auth';
  private refreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  login(dto: AdminLoginDto): Observable<AdminAuthResponseDto> {
    return this.http.post<AdminAuthResponseDto>(`${this.baseUrl}/login`, dto).pipe(
      tap(res => this.storeSession(res))
    );
  }

  logout(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!token && !refreshToken) return false;
    // Even if access token is expired, we're logged in if refresh token exists
    return !!refreshToken;
  }

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
    if (!expiresAt) return true;
    return new Date(expiresAt) <= new Date();
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  getFullName(): string {
    return localStorage.getItem(STORAGE_KEYS.FULL_NAME) ?? '';
  }

  getRole(): string {
    return localStorage.getItem(STORAGE_KEYS.ROLE) ?? '';
  }

  refreshAccessToken(): Observable<AdminAuthResponseDto> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    if (this.refreshing) {
      return this.refreshSubject.pipe(
        switchMap(token => {
          if (token) return new Observable<AdminAuthResponseDto>(sub => sub.complete());
          return throwError(() => new Error('Refresh failed'));
        })
      );
    }

    this.refreshing = true;
    return this.http.post<AdminAuthResponseDto>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      tap(res => {
        this.storeSession(res);
        this.refreshing = false;
        this.refreshSubject.next(res.token);
      }),
      catchError(err => {
        this.refreshing = false;
        this.logout();
        return throwError(() => err);
      })
    );
  }

  private storeSession(res: AdminAuthResponseDto): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, res.refreshToken);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, res.expiresAt);
    localStorage.setItem(STORAGE_KEYS.ADMIN_ID, res.adminId.toString());
    localStorage.setItem(STORAGE_KEYS.FULL_NAME, res.fullName);
    localStorage.setItem(STORAGE_KEYS.EMAIL, res.email);
    localStorage.setItem(STORAGE_KEYS.ROLE, res.role);
  }
}
