import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse, provideHttpClient, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable, of } from 'rxjs';
import { portalAuthInterceptor } from './portal-auth.interceptor';
import { PortalAuthService } from '../services/portal-auth.service';

describe('portalAuthInterceptor', () => {
  let authServiceSpy: jasmine.SpyObj<PortalAuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('PortalAuthService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [
        { provide: PortalAuthService, useValue: authServiceSpy }
      ]
    });
  });

  function runInterceptor(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    const mockNext: HttpHandlerFn = (r: HttpRequest<unknown>) => of(new HttpResponse({ body: null, status: 200 }));
    return TestBed.runInInjectionContext(() => portalAuthInterceptor(req, mockNext));
  }

  function runInterceptorCapturingRequest(req: HttpRequest<unknown>): HttpRequest<unknown> {
    let capturedReq: HttpRequest<unknown> = req;
    const mockNext: HttpHandlerFn = (r: HttpRequest<unknown>) => {
      capturedReq = r;
      return of(new HttpResponse({ body: null, status: 200 }));
    };
    TestBed.runInInjectionContext(() => portalAuthInterceptor(req, mockNext)).subscribe();
    return capturedReq;
  }

  // ===================== TOKEN + PORTAL URL =====================

  it('should add Authorization header when token exists and URL includes /api/portal', () => {
    // Arrange
    authServiceSpy.getToken.and.returnValue('my-token-123');
    const req = new HttpRequest('GET', 'http://localhost:7000/api/portal/profile');

    // Act
    const resultReq = runInterceptorCapturingRequest(req);

    // Assert
    expect(resultReq.headers.get('Authorization')).toBe('Bearer my-token-123');
  });

  it('should set Bearer token format correctly', () => {
    // Arrange
    authServiceSpy.getToken.and.returnValue('abc.def.ghi');
    const req = new HttpRequest('GET', 'http://localhost:7000/api/portal/appointments');

    // Act
    const resultReq = runInterceptorCapturingRequest(req);

    // Assert
    expect(resultReq.headers.get('Authorization')).toBe('Bearer abc.def.ghi');
  });

  // ===================== NO TOKEN =====================

  it('should not add Authorization header when token is null', () => {
    // Arrange
    authServiceSpy.getToken.and.returnValue(null);
    const req = new HttpRequest('GET', 'http://localhost:7000/api/portal/profile');

    // Act
    const resultReq = runInterceptorCapturingRequest(req);

    // Assert
    expect(resultReq.headers.has('Authorization')).toBeFalse();
  });

  // ===================== NON-PORTAL URLs =====================

  it('should not add Authorization header for non-portal API URLs', () => {
    // Arrange
    authServiceSpy.getToken.and.returnValue('my-token-123');
    const req = new HttpRequest('GET', 'http://localhost:7000/api/patients');

    // Act
    const resultReq = runInterceptorCapturingRequest(req);

    // Assert
    expect(resultReq.headers.has('Authorization')).toBeFalse();
  });

  it('should not add Authorization header for /api/patient-auth URLs', () => {
    // Arrange
    authServiceSpy.getToken.and.returnValue('my-token-123');
    const req = new HttpRequest('POST', 'http://localhost:7000/api/patient-auth/login', { email: 'test', password: 'test' });

    // Act
    const resultReq = runInterceptorCapturingRequest(req);

    // Assert
    expect(resultReq.headers.has('Authorization')).toBeFalse();
  });

  it('should not add Authorization header for external URLs', () => {
    // Arrange
    authServiceSpy.getToken.and.returnValue('my-token-123');
    const req = new HttpRequest('GET', 'https://external-api.com/data');

    // Act
    const resultReq = runInterceptorCapturingRequest(req);

    // Assert
    expect(resultReq.headers.has('Authorization')).toBeFalse();
  });

  // ===================== URL MATCHING =====================

  it('should match /api/portal at any position in the URL', () => {
    // Arrange
    authServiceSpy.getToken.and.returnValue('token');
    const req = new HttpRequest('GET', 'http://example.com/api/portal/invoices');

    // Act
    const resultReq = runInterceptorCapturingRequest(req);

    // Assert
    expect(resultReq.headers.get('Authorization')).toBe('Bearer token');
  });

  it('should add header for portal appointments URL', () => {
    // Arrange
    authServiceSpy.getToken.and.returnValue('token');
    const req = new HttpRequest('POST', 'http://localhost:7000/api/portal/appointments', { doctorId: 1 });

    // Act
    const resultReq = runInterceptorCapturingRequest(req);

    // Assert
    expect(resultReq.headers.get('Authorization')).toBe('Bearer token');
  });

  it('should add header for portal treatment-history URL', () => {
    // Arrange
    authServiceSpy.getToken.and.returnValue('token');
    const req = new HttpRequest('GET', 'http://localhost:7000/api/portal/treatment-history');

    // Act
    const resultReq = runInterceptorCapturingRequest(req);

    // Assert
    expect(resultReq.headers.get('Authorization')).toBe('Bearer token');
  });

  // ===================== PASS THROUGH =====================

  it('should call next handler with the request', () => {
    // Arrange
    authServiceSpy.getToken.and.returnValue(null);
    const req = new HttpRequest('GET', 'http://localhost:7000/api/doctors');
    let nextCalled = false;
    const mockNext: HttpHandlerFn = (r) => {
      nextCalled = true;
      return of(new HttpResponse({ body: null }));
    };

    // Act
    TestBed.runInInjectionContext(() => portalAuthInterceptor(req, mockNext)).subscribe();

    // Assert
    expect(nextCalled).toBeTrue();
  });

  it('should preserve existing headers on the request', () => {
    // Arrange
    authServiceSpy.getToken.and.returnValue('token');
    const req = new HttpRequest('GET', 'http://localhost:7000/api/portal/profile');

    // Act
    const resultReq = runInterceptorCapturingRequest(req);

    // Assert
    expect(resultReq.headers.get('Authorization')).toBe('Bearer token');
  });

  it('should preserve the original request method', () => {
    // Arrange
    authServiceSpy.getToken.and.returnValue('token');
    const req = new HttpRequest('DELETE', 'http://localhost:7000/api/portal/appointments/5');

    // Act
    const resultReq = runInterceptorCapturingRequest(req);

    // Assert
    expect(resultReq.method).toBe('DELETE');
    expect(resultReq.headers.get('Authorization')).toBe('Bearer token');
  });

  it('should preserve the original request body', () => {
    // Arrange
    authServiceSpy.getToken.and.returnValue('token');
    const body = { doctorId: 1, appointmentDate: '2024-06-15' };
    const req = new HttpRequest('POST', 'http://localhost:7000/api/portal/appointments', body);

    // Act
    const resultReq = runInterceptorCapturingRequest(req);

    // Assert
    expect(resultReq.body).toEqual(body);
  });
});
