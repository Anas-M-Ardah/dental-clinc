import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService, PagedResult, DashboardStats, TodaySchedule } from './api.service';
import { Patient, Gender } from '../models/patient.model';
import { Appointment, AppointmentStatus } from '../models/appointment.model';
import { Treatment } from '../models/treatment.model';
import { Invoice, InvoiceStatus } from '../models/invoice.model';
import { TreatmentRecord } from '../models/treatment-record.model';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:7000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiService
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===================== PATIENTS =====================

  describe('getPatients', () => {
    const mockPagedResult: PagedResult<Patient> = {
      data: [{ id: 1, firstName: 'John', lastName: 'Doe', phone: '123', dateOfBirth: '1990-01-01', gender: Gender.Male, createdAt: '2024-01-01' }],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10
    };

    it('should send GET request with default pagination params', () => {
      service.getPatients().subscribe(result => {
        expect(result).toEqual(mockPagedResult);
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/patients`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('pageNumber')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('10');
      expect(req.request.params.has('search')).toBeFalse();
      req.flush(mockPagedResult);
    });

    it('should include search param when provided', () => {
      service.getPatients('John').subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/patients`);
      expect(req.request.params.get('search')).toBe('John');
      req.flush(mockPagedResult);
    });

    it('should use custom pagination params', () => {
      service.getPatients(undefined, 3, 25).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/patients`);
      expect(req.request.params.get('pageNumber')).toBe('3');
      expect(req.request.params.get('pageSize')).toBe('25');
      req.flush(mockPagedResult);
    });

    it('should include search with custom pagination', () => {
      service.getPatients('Jane', 2, 20).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/patients`);
      expect(req.request.params.get('search')).toBe('Jane');
      expect(req.request.params.get('pageNumber')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('20');
      req.flush(mockPagedResult);
    });
  });

  describe('getPatient', () => {
    it('should send GET request with patient id', () => {
      const mockPatient: Patient = { id: 5, firstName: 'John', lastName: 'Doe', phone: '123', dateOfBirth: '1990-01-01', gender: Gender.Male, createdAt: '2024-01-01' };

      service.getPatient(5).subscribe(patient => {
        expect(patient).toEqual(mockPatient);
      });

      const req = httpMock.expectOne(`${baseUrl}/patients/5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatient);
    });
  });

  describe('createPatient', () => {
    it('should send POST request with patient data', () => {
      const dto = { firstName: 'Jane', lastName: 'Doe', phone: '456', dateOfBirth: '1985-05-15', gender: Gender.Female };
      const mockResponse: Patient = { id: 10, ...dto, createdAt: '2024-06-01' };

      service.createPatient(dto).subscribe(patient => {
        expect(patient).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/patients`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });
  });

  describe('updatePatient', () => {
    it('should send PUT request with id and updated data', () => {
      const dto = { firstName: 'Jane', lastName: 'Smith', phone: '789', dateOfBirth: '1985-05-15', gender: Gender.Female };
      const mockResponse: Patient = { id: 3, ...dto, createdAt: '2024-01-01' };

      service.updatePatient(3, dto).subscribe(patient => {
        expect(patient).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/patients/3`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });
  });

  describe('deletePatient', () => {
    it('should send DELETE request with patient id', () => {
      service.deletePatient(7).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/patients/7`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ===================== DOCTORS =====================

  describe('getDoctors', () => {
    it('should send GET request and return doctor array', () => {
      const mockDoctors = [{ id: 1, name: 'Dr. Smith' }];

      service.getDoctors().subscribe(doctors => {
        expect(doctors).toEqual(mockDoctors as any);
      });

      const req = httpMock.expectOne(`${baseUrl}/doctors`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDoctors);
    });
  });

  describe('getDoctor', () => {
    it('should send GET request with doctor id', () => {
      const mockDoctor = { id: 2, name: 'Dr. Jones' };

      service.getDoctor(2).subscribe(doctor => {
        expect(doctor).toEqual(mockDoctor as any);
      });

      const req = httpMock.expectOne(`${baseUrl}/doctors/2`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDoctor);
    });
  });

  describe('getDoctorSchedule', () => {
    it('should send GET request without date param when not provided', () => {
      service.getDoctorSchedule(1).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/doctors/1/schedule`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.has('date')).toBeFalse();
      req.flush({});
    });

    it('should send GET request with date param when provided', () => {
      service.getDoctorSchedule(1, '2024-06-15').subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/doctors/1/schedule`);
      expect(req.request.params.get('date')).toBe('2024-06-15');
      req.flush({});
    });
  });

  // ===================== APPOINTMENTS =====================

  describe('getAppointments', () => {
    const mockResult: PagedResult<Appointment> = {
      data: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10
    };

    it('should send GET request with default pagination only', () => {
      service.getAppointments().subscribe(result => {
        expect(result).toEqual(mockResult);
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/appointments`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('pageNumber')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('10');
      expect(req.request.params.has('doctorId')).toBeFalse();
      expect(req.request.params.has('patientId')).toBeFalse();
      expect(req.request.params.has('date')).toBeFalse();
      expect(req.request.params.has('status')).toBeFalse();
      req.flush(mockResult);
    });

    it('should include doctorId param when provided', () => {
      service.getAppointments(5).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/appointments`);
      expect(req.request.params.get('doctorId')).toBe('5');
      req.flush(mockResult);
    });

    it('should include patientId param when provided', () => {
      service.getAppointments(undefined, 3).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/appointments`);
      expect(req.request.params.get('patientId')).toBe('3');
      expect(req.request.params.has('doctorId')).toBeFalse();
      req.flush(mockResult);
    });

    it('should include date param when provided', () => {
      service.getAppointments(undefined, undefined, '2024-06-15').subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/appointments`);
      expect(req.request.params.get('date')).toBe('2024-06-15');
      req.flush(mockResult);
    });

    it('should include status param when provided (including 0)', () => {
      service.getAppointments(undefined, undefined, undefined, AppointmentStatus.Pending).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/appointments`);
      expect(req.request.params.get('status')).toBe('0');
      req.flush(mockResult);
    });

    it('should include all optional params when provided', () => {
      service.getAppointments(1, 2, '2024-06-15', AppointmentStatus.Confirmed, 2, 20).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/appointments`);
      expect(req.request.params.get('doctorId')).toBe('1');
      expect(req.request.params.get('patientId')).toBe('2');
      expect(req.request.params.get('date')).toBe('2024-06-15');
      expect(req.request.params.get('status')).toBe('1');
      expect(req.request.params.get('pageNumber')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('20');
      req.flush(mockResult);
    });
  });

  describe('getAppointment', () => {
    it('should send GET request with appointment id', () => {
      const mockAppointment = { id: 10 } as Appointment;

      service.getAppointment(10).subscribe(appointment => {
        expect(appointment).toEqual(mockAppointment);
      });

      const req = httpMock.expectOne(`${baseUrl}/appointments/10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointment);
    });
  });

  describe('getAvailableSlots', () => {
    it('should send GET request with doctorId and date params', () => {
      const mockSlots = { availableSlots: [{ startTime: '09:00', endTime: '09:30' }] };

      service.getAvailableSlots(1, '2024-06-15').subscribe(result => {
        expect(result).toEqual(mockSlots);
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/appointments/available-slots`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('doctorId')).toBe('1');
      expect(req.request.params.get('date')).toBe('2024-06-15');
      req.flush(mockSlots);
    });
  });

  describe('createAppointment', () => {
    it('should send POST request with appointment data', () => {
      const dto = { patientId: 1, doctorId: 2, appointmentDate: '2024-06-15', startTime: '09:00', treatmentId: 3 };
      const mockResponse = { id: 20, ...dto } as any;

      service.createAppointment(dto).subscribe(appointment => {
        expect(appointment).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/appointments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });
  });

  describe('updateAppointment', () => {
    it('should send PUT request with id and updated data', () => {
      const dto = { appointmentDate: '2024-06-16', startTime: '10:00', doctorId: 2, status: AppointmentStatus.Confirmed };
      const mockResponse = { id: 20, ...dto } as any;

      service.updateAppointment(20, dto).subscribe(appointment => {
        expect(appointment).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/appointments/20`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });
  });

  describe('deleteAppointment', () => {
    it('should send DELETE request with appointment id', () => {
      service.deleteAppointment(15).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/appointments/15`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ===================== TREATMENTS =====================

  describe('getTreatments', () => {
    it('should send GET request and return treatment array', () => {
      const mockTreatments: Treatment[] = [{ id: 1, name: 'Cleaning', price: 50, durationMinutes: 30, isActive: true }];

      service.getTreatments().subscribe(treatments => {
        expect(treatments).toEqual(mockTreatments);
      });

      const req = httpMock.expectOne(`${baseUrl}/treatments`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTreatments);
    });
  });

  describe('getTreatment', () => {
    it('should send GET request with treatment id', () => {
      const mockTreatment: Treatment = { id: 2, name: 'Filling', price: 100, durationMinutes: 45, isActive: true };

      service.getTreatment(2).subscribe(treatment => {
        expect(treatment).toEqual(mockTreatment);
      });

      const req = httpMock.expectOne(`${baseUrl}/treatments/2`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTreatment);
    });
  });

  describe('createTreatment', () => {
    it('should send POST request with treatment data', () => {
      const dto = { name: 'Root Canal', price: 300, durationMinutes: 90 };
      const mockResponse: Treatment = { id: 5, ...dto, isActive: true };

      service.createTreatment(dto).subscribe(treatment => {
        expect(treatment).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/treatments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });
  });

  describe('updateTreatment', () => {
    it('should send PUT request with id and updated data', () => {
      const dto = { name: 'Root Canal Updated', price: 350, durationMinutes: 100 };
      const mockResponse: Treatment = { id: 5, ...dto, isActive: true };

      service.updateTreatment(5, dto).subscribe(treatment => {
        expect(treatment).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/treatments/5`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });
  });

  describe('deleteTreatment', () => {
    it('should send DELETE request with treatment id', () => {
      service.deleteTreatment(4).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/treatments/4`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ===================== INVOICES =====================

  describe('getInvoices', () => {
    const mockResult: PagedResult<Invoice> = {
      data: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10
    };

    it('should send GET request with default pagination only', () => {
      service.getInvoices().subscribe(result => {
        expect(result).toEqual(mockResult);
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/invoices`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('pageNumber')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('10');
      expect(req.request.params.has('patientId')).toBeFalse();
      expect(req.request.params.has('status')).toBeFalse();
      expect(req.request.params.has('startDate')).toBeFalse();
      expect(req.request.params.has('endDate')).toBeFalse();
      req.flush(mockResult);
    });

    it('should include patientId param when provided', () => {
      service.getInvoices(5).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/invoices`);
      expect(req.request.params.get('patientId')).toBe('5');
      req.flush(mockResult);
    });

    it('should include status param when provided (including 0)', () => {
      service.getInvoices(undefined, InvoiceStatus.Pending).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/invoices`);
      expect(req.request.params.get('status')).toBe('0');
      req.flush(mockResult);
    });

    it('should include date range params when provided', () => {
      service.getInvoices(undefined, undefined, '2024-01-01', '2024-06-30').subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/invoices`);
      expect(req.request.params.get('startDate')).toBe('2024-01-01');
      expect(req.request.params.get('endDate')).toBe('2024-06-30');
      req.flush(mockResult);
    });

    it('should include all optional params when provided', () => {
      service.getInvoices(1, InvoiceStatus.Paid, '2024-01-01', '2024-12-31', 3, 15).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/invoices`);
      expect(req.request.params.get('patientId')).toBe('1');
      expect(req.request.params.get('status')).toBe('1');
      expect(req.request.params.get('startDate')).toBe('2024-01-01');
      expect(req.request.params.get('endDate')).toBe('2024-12-31');
      expect(req.request.params.get('pageNumber')).toBe('3');
      expect(req.request.params.get('pageSize')).toBe('15');
      req.flush(mockResult);
    });
  });

  describe('getInvoice', () => {
    it('should send GET request with invoice id', () => {
      const mockInvoice = { id: 8 } as Invoice;

      service.getInvoice(8).subscribe(invoice => {
        expect(invoice).toEqual(mockInvoice);
      });

      const req = httpMock.expectOne(`${baseUrl}/invoices/8`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInvoice);
    });
  });

  describe('createInvoice', () => {
    it('should send POST request with invoice data', () => {
      const dto = { patientId: 1, items: [{ treatmentId: 2, quantity: 1 }] };
      const mockResponse = { id: 12, ...dto } as any;

      service.createInvoice(dto).subscribe(invoice => {
        expect(invoice).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/invoices`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });
  });

  describe('payInvoice', () => {
    it('should send PATCH request with id and payment data', () => {
      const dto = { paymentMethod: 'cash', notes: 'Paid in full' };
      const mockResponse = { id: 12, status: InvoiceStatus.Paid } as Invoice;

      service.payInvoice(12, dto).subscribe(invoice => {
        expect(invoice).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/invoices/12/pay`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });
  });

  describe('cancelInvoice', () => {
    it('should send PATCH request with empty body', () => {
      const mockResponse = { id: 12, status: InvoiceStatus.Cancelled } as Invoice;

      service.cancelInvoice(12).subscribe(invoice => {
        expect(invoice).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/invoices/12/cancel`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  // ===================== DASHBOARD =====================

  describe('getDashboardStats', () => {
    it('should send GET request and return dashboard stats', () => {
      const mockStats: DashboardStats = {
        todayAppointments: 5,
        totalPatients: 100,
        monthlyRevenue: 5000,
        pendingInvoices: 3,
        cancelledToday: 1
      };

      service.getDashboardStats().subscribe(stats => {
        expect(stats).toEqual(mockStats);
      });

      const req = httpMock.expectOne(`${baseUrl}/dashboard/stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });
  });

  describe('getTodaySchedule', () => {
    it('should send GET request and return today schedule', () => {
      const mockSchedule: TodaySchedule = {
        date: '2024-06-15',
        appointments: []
      };

      service.getTodaySchedule().subscribe(schedule => {
        expect(schedule).toEqual(mockSchedule);
      });

      const req = httpMock.expectOne(`${baseUrl}/dashboard/today-schedule`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSchedule);
    });
  });

  describe('getRecentPatients', () => {
    it('should send GET request with default count of 5', () => {
      const mockPatients: Patient[] = [];

      service.getRecentPatients().subscribe(patients => {
        expect(patients).toEqual(mockPatients);
      });

      const req = httpMock.expectOne(`${baseUrl}/dashboard/recent-patients?count=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatients);
    });

    it('should send GET request with custom count', () => {
      service.getRecentPatients(10).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/dashboard/recent-patients?count=10`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  // ===================== TREATMENT RECORDS =====================

  describe('getTreatmentRecordsByPatient', () => {
    it('should send GET request with patient id in URL', () => {
      const mockRecords: TreatmentRecord[] = [];

      service.getTreatmentRecordsByPatient(7).subscribe(records => {
        expect(records).toEqual(mockRecords);
      });

      const req = httpMock.expectOne(`${baseUrl}/treatment-records/patient/7`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRecords);
    });
  });

  describe('getTreatmentRecord', () => {
    it('should send GET request with record id', () => {
      const mockRecord = { id: 3 } as TreatmentRecord;

      service.getTreatmentRecord(3).subscribe(record => {
        expect(record).toEqual(mockRecord);
      });

      const req = httpMock.expectOne(`${baseUrl}/treatment-records/3`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRecord);
    });
  });

  describe('createTreatmentRecord', () => {
    it('should send POST request with treatment record data', () => {
      const dto = {
        patientId: 1, doctorId: 2, visitDate: '2024-06-15',
        chiefComplaint: 'Tooth pain', painLevel: 5, symptomDuration: '2 days',
        extraoralFindings: '', intraoralFindings: '', teethCondition: '', gumCondition: '',
        radiographicFindings: '', primaryDiagnosis: 'Cavity', secondaryDiagnoses: '',
        treatmentPlan: 'Filling', treatmentStages: '', estimatedCost: 100,
        procedurePerformed: 'Filling', anaesthesiaUsed: 'Local', materialsUsed: 'Composite',
        complications: 'None', procedureDurationMinutes: 30, prescriptions: '',
        postTreatmentInstructions: '', recallPeriodDays: 180, notes: ''
      };
      const mockResponse = { id: 15, ...dto } as any;

      service.createTreatmentRecord(dto).subscribe(record => {
        expect(record).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/treatment-records`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });
  });

  describe('updateTreatmentRecord', () => {
    it('should send PUT request with id and updated data', () => {
      const dto = {
        visitDate: '2024-06-15', chiefComplaint: 'Updated complaint', painLevel: 3,
        symptomDuration: '1 day', extraoralFindings: '', intraoralFindings: '',
        teethCondition: '', gumCondition: '', radiographicFindings: '',
        primaryDiagnosis: 'Updated', secondaryDiagnoses: '', treatmentPlan: 'Updated plan',
        treatmentStages: '', estimatedCost: 150, procedurePerformed: 'Updated',
        anaesthesiaUsed: '', materialsUsed: '', complications: '',
        procedureDurationMinutes: 45, prescriptions: '', postTreatmentInstructions: '',
        recallPeriodDays: 90, notes: ''
      };
      const mockResponse = { id: 15, ...dto } as any;

      service.updateTreatmentRecord(15, dto).subscribe(record => {
        expect(record).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/treatment-records/15`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });
  });

  describe('deleteTreatmentRecord', () => {
    it('should send DELETE request with record id', () => {
      service.deleteTreatmentRecord(9).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/treatment-records/9`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
