import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PortalApiService } from './portal-api.service';
import { PagedResult } from './api.service';
import { Patient, Gender } from '../models/patient.model';
import { Appointment, AppointmentStatus } from '../models/appointment.model';
import { Invoice, InvoiceStatus } from '../models/invoice.model';
import { TreatmentRecord } from '../models/treatment-record.model';

describe('PortalApiService', () => {
  let service: PortalApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:7000/api/portal';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PortalApiService
      ]
    });
    service = TestBed.inject(PortalApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===================== PROFILE =====================

  describe('getProfile', () => {
    it('should send GET request to profile endpoint', () => {
      const mockPatient: Patient = {
        id: 1, firstName: 'John', lastName: 'Doe', phone: '123',
        dateOfBirth: '1990-01-01', gender: Gender.Male, createdAt: '2024-01-01'
      };

      service.getProfile().subscribe(patient => {
        expect(patient).toEqual(mockPatient);
      });

      const req = httpMock.expectOne(`${baseUrl}/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatient);
    });
  });

  describe('updateProfile', () => {
    it('should send PUT request with profile data', () => {
      const dto = { firstName: 'Jane', lastName: 'Smith', phone: '456' };
      const mockResponse: Patient = {
        id: 1, firstName: 'Jane', lastName: 'Smith', phone: '456',
        dateOfBirth: '1990-01-01', gender: Gender.Female, createdAt: '2024-01-01'
      };

      service.updateProfile(dto).subscribe(patient => {
        expect(patient).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/profile`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });

    it('should include optional address field', () => {
      const dto = { firstName: 'Jane', lastName: 'Smith', phone: '456', address: '123 Main St' };

      service.updateProfile(dto).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/profile`);
      expect(req.request.body.address).toBe('123 Main St');
      req.flush({});
    });
  });

  // ===================== APPOINTMENTS =====================

  describe('getMyAppointments', () => {
    const mockResult: PagedResult<Appointment> = {
      data: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10
    };

    it('should send GET request with default pagination', () => {
      service.getMyAppointments().subscribe(result => {
        expect(result).toEqual(mockResult);
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/appointments`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('pageNumber')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('10');
      expect(req.request.params.has('status')).toBeFalse();
      req.flush(mockResult);
    });

    it('should include status param when provided', () => {
      service.getMyAppointments(AppointmentStatus.Confirmed).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/appointments`);
      expect(req.request.params.get('status')).toBe('1');
      req.flush(mockResult);
    });

    it('should handle status 0 (Pending) correctly', () => {
      service.getMyAppointments(AppointmentStatus.Pending).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/appointments`);
      expect(req.request.params.get('status')).toBe('0');
      req.flush(mockResult);
    });

    it('should use custom pagination params', () => {
      service.getMyAppointments(undefined, 2, 25).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/appointments`);
      expect(req.request.params.get('pageNumber')).toBe('2');
      expect(req.request.params.get('pageSize')).toBe('25');
      req.flush(mockResult);
    });

    it('should include status with custom pagination', () => {
      service.getMyAppointments(AppointmentStatus.Completed, 3, 15).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/appointments`);
      expect(req.request.params.get('status')).toBe('3');
      expect(req.request.params.get('pageNumber')).toBe('3');
      expect(req.request.params.get('pageSize')).toBe('15');
      req.flush(mockResult);
    });
  });

  describe('bookAppointment', () => {
    it('should send POST request with booking data', () => {
      const dto = {
        doctorId: 1, appointmentDate: '2024-06-15',
        startTime: '09:00', treatmentId: 2
      };
      const mockResponse = { id: 10, ...dto } as any;

      service.bookAppointment(dto).subscribe(appointment => {
        expect(appointment).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/appointments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });

    it('should include optional notes in booking', () => {
      const dto = {
        doctorId: 1, appointmentDate: '2024-06-15',
        startTime: '09:00', treatmentId: 2, notes: 'First visit'
      };

      service.bookAppointment(dto).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/appointments`);
      expect(req.request.body.notes).toBe('First visit');
      req.flush({});
    });
  });

  describe('cancelAppointment', () => {
    it('should send DELETE request with appointment id', () => {
      service.cancelAppointment(5).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/appointments/5`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ===================== INVOICES =====================

  describe('getMyInvoices', () => {
    const mockResult: PagedResult<Invoice> = {
      data: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10
    };

    it('should send GET request with default pagination', () => {
      service.getMyInvoices().subscribe(result => {
        expect(result).toEqual(mockResult);
      });

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/invoices`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('pageNumber')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('10');
      expect(req.request.params.has('status')).toBeFalse();
      req.flush(mockResult);
    });

    it('should include status param when provided', () => {
      service.getMyInvoices(InvoiceStatus.Paid).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/invoices`);
      expect(req.request.params.get('status')).toBe('1');
      req.flush(mockResult);
    });

    it('should handle status 0 (Pending) correctly', () => {
      service.getMyInvoices(InvoiceStatus.Pending).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/invoices`);
      expect(req.request.params.get('status')).toBe('0');
      req.flush(mockResult);
    });

    it('should use custom pagination params', () => {
      service.getMyInvoices(undefined, 4, 50).subscribe();

      const req = httpMock.expectOne(r => r.url === `${baseUrl}/invoices`);
      expect(req.request.params.get('pageNumber')).toBe('4');
      expect(req.request.params.get('pageSize')).toBe('50');
      req.flush(mockResult);
    });
  });

  // ===================== TREATMENT HISTORY =====================

  describe('getTreatmentHistory', () => {
    it('should send GET request to treatment-history endpoint', () => {
      const mockRecords: TreatmentRecord[] = [];

      service.getTreatmentHistory().subscribe(records => {
        expect(records).toEqual(mockRecords);
      });

      const req = httpMock.expectOne(`${baseUrl}/treatment-history`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRecords);
    });

    it('should return treatment records array', () => {
      const mockRecords = [{ id: 1, chiefComplaint: 'Toothache' }] as any[];

      service.getTreatmentHistory().subscribe(records => {
        expect(records.length).toBe(1);
        expect(records[0].chiefComplaint).toBe('Toothache');
      });

      const req = httpMock.expectOne(`${baseUrl}/treatment-history`);
      req.flush(mockRecords);
    });
  });
});
