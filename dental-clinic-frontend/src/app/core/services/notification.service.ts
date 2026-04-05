import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer, switchMap } from 'rxjs';
import { NotificationDto, UnreadCountDto } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = 'http://localhost:7000/api/portal/notifications';
  private unreadCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  get unreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  getNotifications(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(this.baseUrl);
  }

  refreshUnreadCount(): void {
    this.http.get<UnreadCountDto>(`${this.baseUrl}/unread-count`).subscribe({
      next: res => this.unreadCount$.next(res.count),
      error: () => this.unreadCount$.next(0)
    });
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/read-all`, {});
  }

  startPolling(intervalMs = 60000): void {
    timer(0, intervalMs).pipe(
      switchMap(() => this.http.get<UnreadCountDto>(`${this.baseUrl}/unread-count`))
    ).subscribe({
      next: res => this.unreadCount$.next(res.count),
      error: () => {}
    });
  }
}
