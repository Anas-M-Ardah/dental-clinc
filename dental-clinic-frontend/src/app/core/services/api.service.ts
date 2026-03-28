import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient, CreatePatientDto, UpdatePatientDto } from '../models/patient.model';
import { Doctor } from '../models/doctor.model';
import { Appointment, CreateAppointmentDto, UpdateAppointmentDto, AvailableSlot } from '../models/appointment.model';
import { Treatment, CreateTreatmentDto } from '../models/treatment.model';
import { Invoice, CreateInvoiceDto, PayInvoiceDto } from '../models/invoice.model';
import { TreatmentRecord, CreateTreatmentRecordDto, UpdateTreatmentRecordDto } from '../models/treatment-record.model';

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  cancelledToday: number;
}

export interface TodaySchedule {
  date: string;
  appointments: Appointment[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:7000/api';

  constructor(private http: HttpClient) {}

  // Patients
  getPatients(search?: string, pageNumber = 1, pageSize = 10): Observable<PagedResult<Patient>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.http.get<PagedResult<Patient>>(`${this.baseUrl}/patients`, { params });
  }

  getPatient(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/patients/${id}`);
  }

  createPatient(dto: CreatePatientDto): Observable<Patient> {
    return this.http.post<Patient>(`${this.baseUrl}/patients`, dto);
  }

  updatePatient(id: number, dto: UpdatePatientDto): Observable<Patient> {
    return this.http.put<Patient>(`${this.baseUrl}/patients/${id}`, dto);
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/patients/${id}`);
  }

  // Doctors
  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/doctors`);
  }

  getDoctor(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.baseUrl}/doctors/${id}`);
  }

  getDoctorSchedule(id: number, date?: string): Observable<any> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<any>(`${this.baseUrl}/doctors/${id}/schedule`, { params });
  }

  // Appointments
  getAppointments(doctorId?: number, patientId?: number, date?: string, status?: number, pageNumber = 1, pageSize = 10): Observable<PagedResult<Appointment>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    if (doctorId) params = params.set('doctorId', doctorId);
    if (patientId) params = params.set('patientId', patientId);
    if (date) params = params.set('date', date);
    if (status !== undefined) params = params.set('status', status);
    return this.http.get<PagedResult<Appointment>>(`${this.baseUrl}/appointments`, { params });
  }

  getAppointment(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.baseUrl}/appointments/${id}`);
  }

  getAvailableSlots(doctorId: number, date: string): Observable<{ availableSlots: AvailableSlot[] }> {
    const params = new HttpParams()
      .set('doctorId', doctorId)
      .set('date', date);
    return this.http.get<{ availableSlots: AvailableSlot[] }>(`${this.baseUrl}/appointments/available-slots`, { params });
  }

  createAppointment(dto: CreateAppointmentDto): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments`, dto);
  }

  updateAppointment(id: number, dto: UpdateAppointmentDto): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.baseUrl}/appointments/${id}`, dto);
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/appointments/${id}`);
  }

  // Treatments
  getTreatments(): Observable<Treatment[]> {
    return this.http.get<Treatment[]>(`${this.baseUrl}/treatments`);
  }

  getTreatment(id: number): Observable<Treatment> {
    return this.http.get<Treatment>(`${this.baseUrl}/treatments/${id}`);
  }

  createTreatment(dto: CreateTreatmentDto): Observable<Treatment> {
    return this.http.post<Treatment>(`${this.baseUrl}/treatments`, dto);
  }

  updateTreatment(id: number, dto: CreateTreatmentDto): Observable<Treatment> {
    return this.http.put<Treatment>(`${this.baseUrl}/treatments/${id}`, dto);
  }

  deleteTreatment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/treatments/${id}`);
  }

  // Invoices
  getInvoices(patientId?: number, status?: number, startDate?: string, endDate?: string, pageNumber = 1, pageSize = 10): Observable<PagedResult<Invoice>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    if (patientId) params = params.set('patientId', patientId);
    if (status !== undefined) params = params.set('status', status);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<PagedResult<Invoice>>(`${this.baseUrl}/invoices`, { params });
  }

  getInvoice(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.baseUrl}/invoices/${id}`);
  }

  createInvoice(dto: CreateInvoiceDto): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.baseUrl}/invoices`, dto);
  }

  payInvoice(id: number, dto: PayInvoiceDto): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.baseUrl}/invoices/${id}/pay`, dto);
  }

  cancelInvoice(id: number): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.baseUrl}/invoices/${id}/cancel`, {});
  }

  // Dashboard
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`);
  }

  getTodaySchedule(): Observable<TodaySchedule> {
    return this.http.get<TodaySchedule>(`${this.baseUrl}/dashboard/today-schedule`);
  }

  getRecentPatients(count = 5): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.baseUrl}/dashboard/recent-patients?count=${count}`);
  }

  // Treatment Records
  getTreatmentRecordsByPatient(patientId: number): Observable<TreatmentRecord[]> {
    return this.http.get<TreatmentRecord[]>(`${this.baseUrl}/treatment-records/patient/${patientId}`);
  }

  getTreatmentRecord(id: number): Observable<TreatmentRecord> {
    return this.http.get<TreatmentRecord>(`${this.baseUrl}/treatment-records/${id}`);
  }

  createTreatmentRecord(dto: CreateTreatmentRecordDto): Observable<TreatmentRecord> {
    return this.http.post<TreatmentRecord>(`${this.baseUrl}/treatmentrecords`, dto);
  }

  updateTreatmentRecord(id: number, dto: UpdateTreatmentRecordDto): Observable<TreatmentRecord> {
    return this.http.put<TreatmentRecord>(`${this.baseUrl}/treatment-records/${id}`, dto);
  }

  deleteTreatmentRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/treatment-records/${id}`);
  }
}
