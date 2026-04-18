import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';
import { Appointment, AppointmentStatus } from '../models/appointment.model';
import { Invoice, PortalPaymentDto, PaymentTransaction } from '../models/invoice.model';
import { TreatmentRecord } from '../models/treatment-record.model';
import { BookAppointmentDto, UpdatePortalProfileDto } from '../models/portal-auth.model';
import { PagedResult } from './api.service';

@Injectable({ providedIn: 'root' })
export class PortalApiService {
  private readonly baseUrl = 'http://localhost:7000/api/portal';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/profile`);
  }

  updateProfile(dto: UpdatePortalProfileDto): Observable<Patient> {
    return this.http.put<Patient>(`${this.baseUrl}/profile`, dto);
  }

  getMyAppointments(status?: AppointmentStatus, pageNumber = 1, pageSize = 10): Observable<PagedResult<Appointment>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    if (status !== undefined) params = params.set('status', status);
    return this.http.get<PagedResult<Appointment>>(`${this.baseUrl}/appointments`, { params });
  }

  bookAppointment(dto: BookAppointmentDto): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments`, dto);
  }

  cancelAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/appointments/${id}`);
  }

  getMyInvoices(status?: number, pageNumber = 1, pageSize = 10): Observable<PagedResult<Invoice>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    if (status !== undefined) params = params.set('status', status);
    return this.http.get<PagedResult<Invoice>>(`${this.baseUrl}/invoices`, { params });
  }

  getMyInvoice(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.baseUrl}/invoices/${id}`);
  }

  payInvoice(id: number, dto: PortalPaymentDto): Observable<PaymentTransaction> {
    return this.http.post<PaymentTransaction>(`${this.baseUrl}/invoices/${id}/pay`, dto);
  }

  getTreatmentHistory(): Observable<TreatmentRecord[]> {
    return this.http.get<TreatmentRecord[]>(`${this.baseUrl}/treatment-history`);
  }

  updateNotificationPreferences(dto: { emailNotificationsEnabled: boolean; smsNotificationsEnabled: boolean }): Observable<Patient> {
    return this.http.put<Patient>(`${this.baseUrl}/notification-preferences`, dto);
  }

  getMyDocuments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/documents`);
  }

  getDocumentDownloadUrl(id: number): string {
    return `${this.baseUrl}/documents/${id}/download`;
  }

  getMyMedicalHistory(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/medical-history`);
  }

  changePassword(dto: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/change-password`, dto);
  }

  getMySurveys(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/surveys`);
  }

  getPendingSurveyAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/surveys/pending`);
  }

  submitSurvey(dto: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/surveys`, dto);
  }
}
