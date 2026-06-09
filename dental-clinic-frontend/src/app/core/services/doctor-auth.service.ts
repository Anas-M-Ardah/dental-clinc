import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, switchMap, throwError, BehaviorSubject } from 'rxjs';
import { DoctorAuthResponseDto, DoctorLoginDto } from '../models/doctor-auth.model';

const STORAGE_KEYS = {
  TOKEN: 'doctor_token',
  REFRESH_TOKEN: 'doctor_refresh_token',
  EXPIRES_AT: 'doctor_expires_at',
  DOCTOR_ID: 'doctor_id',
  FULL_NAME: 'doctor_full_name',
  EMAIL: 'doctor_email',
  SPECIALIZATION: 'doctor_specialization'
} as const;

@Injectable({ providedIn: 'root' })
export class DoctorAuthService {
  private readonly baseUrl = 'http://localhost:7000/api/doctor-auth';
  private refreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  login(dto: DoctorLoginDto): Observable<DoctorAuthResponseDto> {
    return this.http.post<DoctorAuthResponseDto>(`${this.baseUrl}/login`, dto).pipe(
      tap(res => this.storeSession(res))
    );
  }

  logout(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    this.router.navigate(['/doctor/login']);
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

  getDoctorId(): number {
    return parseInt(localStorage.getItem(STORAGE_KEYS.DOCTOR_ID) ?? '0', 10);
  }

  getFullName(): string {
    return localStorage.getItem(STORAGE_KEYS.FULL_NAME) ?? '';
  }

  getSpecialization(): string {
    return localStorage.getItem(STORAGE_KEYS.SPECIALIZATION) ?? '';
  }

  refreshAccessToken(): Observable<DoctorAuthResponseDto> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    if (this.refreshing) {
      return this.refreshSubject.pipe(
        switchMap(token => {
          if (token) return new Observable<DoctorAuthResponseDto>(sub => sub.complete());
          return throwError(() => new Error('Refresh failed'));
        })
      );
    }

    this.refreshing = true;
    return this.http.post<DoctorAuthResponseDto>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
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

  private storeSession(res: DoctorAuthResponseDto): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, res.refreshToken);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, res.expiresAt);
    localStorage.setItem(STORAGE_KEYS.DOCTOR_ID, res.doctorId.toString());
    localStorage.setItem(STORAGE_KEYS.FULL_NAME, res.fullName);
    localStorage.setItem(STORAGE_KEYS.EMAIL, res.email);
    localStorage.setItem(STORAGE_KEYS.SPECIALIZATION, res.specialization);
  }
}
