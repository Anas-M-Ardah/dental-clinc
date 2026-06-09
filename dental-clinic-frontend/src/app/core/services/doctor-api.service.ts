import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment, AppointmentStatus } from '../models/appointment.model';
import { Patient } from '../models/patient.model';
import { TreatmentRecord } from '../models/treatment-record.model';
import { PagedResult } from './api.service';
import {
  CompleteAppointmentDto,
  CreateDoctorLeaveDto,
  DoctorChangePasswordDto,
  DoctorCreateTreatmentRecordDto,
  DoctorDashboardDto,
  DoctorLeaveDto,
  DoctorPerformanceDto,
  DoctorProfileDto,
  DoctorWorkingHoursDto,
  UpdateDoctorProfileDto,
  UpsertWorkingHoursDto
} from '../models/doctor-auth.model';

@Injectable({ providedIn: 'root' })
export class DoctorApiService {
  private readonly baseUrl = 'http://localhost:7000/api/doctor-portal';

  constructor(private http: HttpClient) {}

  // ----- Profile -----
  getProfile(): Observable<DoctorProfileDto> {
    return this.http.get<DoctorProfileDto>(`${this.baseUrl}/profile`);
  }

  updateProfile(dto: UpdateDoctorProfileDto): Observable<DoctorProfileDto> {
    return this.http.put<DoctorProfileDto>(`${this.baseUrl}/profile`, dto);
  }

  changePassword(dto: DoctorChangePasswordDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/change-password`, dto);
  }

  // ----- Dashboard -----
  getDashboard(): Observable<DoctorDashboardDto> {
    return this.http.get<DoctorDashboardDto>(`${this.baseUrl}/dashboard`);
  }

  // ----- Appointments -----
  getAppointments(filter?: 'today' | 'upcoming' | 'past', status?: AppointmentStatus, pageNumber = 1, pageSize = 20): Observable<PagedResult<Appointment>> {
    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);
    if (filter) params = params.set('filter', filter);
    if (status !== undefined && status !== null) params = params.set('status', status);
    return this.http.get<PagedResult<Appointment>>(`${this.baseUrl}/appointments`, { params });
  }

  getAppointment(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.baseUrl}/appointments/${id}`);
  }

  confirmAppointment(id: number): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}/confirm`, {});
  }

  completeAppointment(id: number, dto: CompleteAppointmentDto): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}/complete`, dto);
  }

  markNoShow(id: number): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}/no-show`, {});
  }

  // ----- Patients -----
  getPatientMedicalHistory(patientId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/patients/${patientId}`);
  }

  getPatientProfile(patientId: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/patients/${patientId}/profile`);
  }

  // ----- Treatment Records -----
  getPatientTreatmentRecords(patientId: number): Observable<TreatmentRecord[]> {
    return this.http.get<TreatmentRecord[]>(`${this.baseUrl}/patients/${patientId}/treatment-records`);
  }

  createTreatmentRecord(dto: DoctorCreateTreatmentRecordDto): Observable<TreatmentRecord> {
    return this.http.post<TreatmentRecord>(`${this.baseUrl}/treatment-records`, dto);
  }

  // ----- Documents -----
  getPatientDocuments(patientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/patients/${patientId}/documents`);
  }

  uploadPatientDocument(patientId: number, file: File, type: number, description?: string, treatmentRecordId?: number): Observable<any> {
    const form = new FormData();
    form.append('file', file);
    form.append('type', String(type));
    if (description) form.append('description', description);
    if (treatmentRecordId !== undefined) form.append('treatmentRecordId', String(treatmentRecordId));
    return this.http.post<any>(`${this.baseUrl}/patients/${patientId}/documents`, form);
  }

  getDocumentDownloadUrl(id: number): string {
    return `${this.baseUrl}/documents/${id}/download`;
  }

  // ----- Medical History writes -----
  addAllergy(patientId: number, dto: { allergyName: string; severity?: string; notes?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/patients/${patientId}/allergies`, dto);
  }
  deleteAllergy(patientId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/patients/${patientId}/allergies/${id}`);
  }
  addMedication(patientId: number, dto: { medicationName: string; dosage?: string; frequency?: string; isActive?: boolean; notes?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/patients/${patientId}/medications`, dto);
  }
  deleteMedication(patientId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/patients/${patientId}/medications/${id}`);
  }
  addCondition(patientId: number, dto: { conditionName: string; diagnosedDate?: string; isActive?: boolean; notes?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/patients/${patientId}/conditions`, dto);
  }
  deleteCondition(patientId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/patients/${patientId}/conditions/${id}`);
  }

  // ----- Schedule -----
  getWorkingHours(): Observable<DoctorWorkingHoursDto[]> {
    return this.http.get<DoctorWorkingHoursDto[]>(`${this.baseUrl}/working-hours`);
  }

  upsertWorkingHours(dto: UpsertWorkingHoursDto): Observable<DoctorWorkingHoursDto> {
    return this.http.put<DoctorWorkingHoursDto>(`${this.baseUrl}/working-hours`, dto);
  }

  getLeaves(): Observable<DoctorLeaveDto[]> {
    return this.http.get<DoctorLeaveDto[]>(`${this.baseUrl}/leaves`);
  }

  addLeave(dto: CreateDoctorLeaveDto): Observable<DoctorLeaveDto> {
    return this.http.post<DoctorLeaveDto>(`${this.baseUrl}/leaves`, dto);
  }

  deleteLeave(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/leaves/${id}`);
  }

  // ----- Stats -----
  getStats(startDate?: string, endDate?: string): Observable<DoctorPerformanceDto> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<DoctorPerformanceDto>(`${this.baseUrl}/stats`, { params });
  }
}
