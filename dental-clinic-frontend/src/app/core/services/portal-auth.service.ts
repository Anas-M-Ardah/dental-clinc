import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, switchMap, throwError, BehaviorSubject } from 'rxjs';
import { AuthResponseDto, PatientLoginDto, PatientRegisterDto } from '../models/portal-auth.model';

const STORAGE_KEYS = {
  TOKEN: 'portal_token',
  REFRESH_TOKEN: 'portal_refresh_token',
  EXPIRES_AT: 'portal_expires_at',
  PATIENT_ID: 'portal_patient_id',
  FULL_NAME: 'portal_full_name',
  EMAIL: 'portal_email'
} as const;

@Injectable({ providedIn: 'root' })
export class PortalAuthService {
  private readonly baseUrl = 'http://localhost:7000/api/patient-auth';
  private refreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  login(dto: PatientLoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.baseUrl}/login`, dto).pipe(
      tap(res => this.storeSession(res))
    );
  }

  register(dto: PatientRegisterDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.baseUrl}/register`, dto).pipe(
      tap(res => this.storeSession(res))
    );
  }

  logout(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    this.router.navigate(['/portal/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!token && !refreshToken) return false;
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

  getPatientId(): number {
    return parseInt(localStorage.getItem(STORAGE_KEYS.PATIENT_ID) ?? '0', 10);
  }

  getFullName(): string {
    return localStorage.getItem(STORAGE_KEYS.FULL_NAME) ?? '';
  }

  refreshAccessToken(): Observable<AuthResponseDto> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    if (this.refreshing) {
      return this.refreshSubject.pipe(
        switchMap(token => {
          if (token) return new Observable<AuthResponseDto>(sub => sub.complete());
          return throwError(() => new Error('Refresh failed'));
        })
      );
    }

    this.refreshing = true;
    return this.http.post<AuthResponseDto>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
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

  private storeSession(res: AuthResponseDto): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, res.refreshToken);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, res.expiresAt);
    localStorage.setItem(STORAGE_KEYS.PATIENT_ID, res.patientId.toString());
    localStorage.setItem(STORAGE_KEYS.FULL_NAME, res.fullName);
    localStorage.setItem(STORAGE_KEYS.EMAIL, res.email);
  }
}
