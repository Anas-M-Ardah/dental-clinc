import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { PortalAuthService } from './portal-auth.service';
import { AuthResponseDto } from '../models/portal-auth.model';
import { Gender } from '../models/patient.model';

describe('PortalAuthService', () => {
  let service: PortalAuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  const baseUrl = 'http://localhost:7000/api/patient-auth';

  const mockAuthResponse: AuthResponseDto = {
    token: 'mock-jwt-token-abc123',
    expiresAt: '2025-12-31T23:59:59Z',
    patientId: 42,
    fullName: 'John Doe',
    email: 'john@example.com'
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PortalAuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(PortalAuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===================== LOGIN =====================

  describe('login', () => {
    it('should send POST request to login endpoint', () => {
      const dto = { email: 'john@example.com', password: 'password123' };

      service.login(dto).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockAuthResponse);
    });

    it('should return the auth response', () => {
      const dto = { email: 'john@example.com', password: 'password123' };

      service.login(dto).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/login`);
      req.flush(mockAuthResponse);
    });

    it('should store token in localStorage after successful login', () => {
      const dto = { email: 'john@example.com', password: 'password123' };

      service.login(dto).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/login`);
      req.flush(mockAuthResponse);

      expect(localStorage.getItem('portal_token')).toBe('mock-jwt-token-abc123');
    });

    it('should store expiresAt in localStorage after successful login', () => {
      const dto = { email: 'john@example.com', password: 'password123' };

      service.login(dto).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/login`);
      req.flush(mockAuthResponse);

      expect(localStorage.getItem('portal_expires_at')).toBe('2025-12-31T23:59:59Z');
    });

    it('should store patientId in localStorage after successful login', () => {
      const dto = { email: 'john@example.com', password: 'password123' };

      service.login(dto).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/login`);
      req.flush(mockAuthResponse);

      expect(localStorage.getItem('portal_patient_id')).toBe('42');
    });

    it('should store fullName in localStorage after successful login', () => {
      const dto = { email: 'john@example.com', password: 'password123' };

      service.login(dto).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/login`);
      req.flush(mockAuthResponse);

      expect(localStorage.getItem('portal_full_name')).toBe('John Doe');
    });

    it('should store email in localStorage after successful login', () => {
      const dto = { email: 'john@example.com', password: 'password123' };

      service.login(dto).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/login`);
      req.flush(mockAuthResponse);

      expect(localStorage.getItem('portal_email')).toBe('john@example.com');
    });
  });

  // ===================== REGISTER =====================

  describe('register', () => {
    it('should send POST request to register endpoint', () => {
      const dto = {
        firstName: 'John', lastName: 'Doe', email: 'john@example.com',
        phone: '1234567890', dateOfBirth: '1990-01-01',
        gender: Gender.Male, password: 'password123'
      };

      service.register(dto).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockAuthResponse);
    });

    it('should return the auth response', () => {
      const dto = {
        firstName: 'John', lastName: 'Doe', email: 'john@example.com',
        phone: '1234567890', dateOfBirth: '1990-01-01',
        gender: Gender.Male, password: 'password123'
      };

      service.register(dto).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/register`);
      req.flush(mockAuthResponse);
    });

    it('should store all session data in localStorage after successful registration', () => {
      const dto = {
        firstName: 'John', lastName: 'Doe', email: 'john@example.com',
        phone: '1234567890', dateOfBirth: '1990-01-01',
        gender: Gender.Male, password: 'password123'
      };

      service.register(dto).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/register`);
      req.flush(mockAuthResponse);

      expect(localStorage.getItem('portal_token')).toBe('mock-jwt-token-abc123');
      expect(localStorage.getItem('portal_expires_at')).toBe('2025-12-31T23:59:59Z');
      expect(localStorage.getItem('portal_patient_id')).toBe('42');
      expect(localStorage.getItem('portal_full_name')).toBe('John Doe');
      expect(localStorage.getItem('portal_email')).toBe('john@example.com');
    });
  });

  // ===================== LOGOUT =====================

  describe('logout', () => {
    it('should remove all portal keys from localStorage', () => {
      // Arrange: populate localStorage
      localStorage.setItem('portal_token', 'some-token');
      localStorage.setItem('portal_expires_at', '2025-12-31');
      localStorage.setItem('portal_patient_id', '42');
      localStorage.setItem('portal_full_name', 'John Doe');
      localStorage.setItem('portal_email', 'john@example.com');

      // Act
      service.logout();

      // Assert
      expect(localStorage.getItem('portal_token')).toBeNull();
      expect(localStorage.getItem('portal_expires_at')).toBeNull();
      expect(localStorage.getItem('portal_patient_id')).toBeNull();
      expect(localStorage.getItem('portal_full_name')).toBeNull();
      expect(localStorage.getItem('portal_email')).toBeNull();
    });

    it('should navigate to /portal/login', () => {
      service.logout();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/portal/login']);
    });

    it('should navigate even when localStorage is already empty', () => {
      service.logout();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/portal/login']);
    });

    it('should not affect non-portal localStorage keys', () => {
      localStorage.setItem('some_other_key', 'value');

      service.logout();

      expect(localStorage.getItem('some_other_key')).toBe('value');
      localStorage.removeItem('some_other_key');
    });
  });

  // ===================== IS LOGGED IN =====================

  describe('isLoggedIn', () => {
    it('should return false when no token exists', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('should return false when token exists but no expiresAt', () => {
      localStorage.setItem('portal_token', 'some-token');

      expect(service.isLoggedIn()).toBeFalse();
    });

    it('should return false when expiresAt exists but no token', () => {
      localStorage.setItem('portal_expires_at', '2099-12-31T23:59:59Z');

      expect(service.isLoggedIn()).toBeFalse();
    });

    it('should return false when token is expired', () => {
      localStorage.setItem('portal_token', 'some-token');
      localStorage.setItem('portal_expires_at', '2020-01-01T00:00:00Z');

      expect(service.isLoggedIn()).toBeFalse();
    });

    it('should return true when token exists and is not expired', () => {
      localStorage.setItem('portal_token', 'some-token');
      localStorage.setItem('portal_expires_at', '2099-12-31T23:59:59Z');

      expect(service.isLoggedIn()).toBeTrue();
    });
  });

  // ===================== GET TOKEN =====================

  describe('getToken', () => {
    it('should return null when no token is stored', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return the stored token', () => {
      localStorage.setItem('portal_token', 'my-jwt-token');

      expect(service.getToken()).toBe('my-jwt-token');
    });
  });

  // ===================== GET PATIENT ID =====================

  describe('getPatientId', () => {
    it('should return 0 when no patient id is stored', () => {
      expect(service.getPatientId()).toBe(0);
    });

    it('should return the stored patient id as a number', () => {
      localStorage.setItem('portal_patient_id', '42');

      expect(service.getPatientId()).toBe(42);
    });

    it('should parse string patient id to integer', () => {
      localStorage.setItem('portal_patient_id', '123');

      const result = service.getPatientId();
      expect(result).toBe(123);
      expect(typeof result).toBe('number');
    });
  });

  // ===================== GET FULL NAME =====================

  describe('getFullName', () => {
    it('should return empty string when no name is stored', () => {
      expect(service.getFullName()).toBe('');
    });

    it('should return the stored full name', () => {
      localStorage.setItem('portal_full_name', 'Jane Smith');

      expect(service.getFullName()).toBe('Jane Smith');
    });
  });
});
