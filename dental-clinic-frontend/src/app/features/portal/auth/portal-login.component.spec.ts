import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PortalLoginComponent } from './portal-login.component';
import { PortalAuthService } from '../../../core/services/portal-auth.service';

describe('PortalLoginComponent', () => {
  let component: PortalLoginComponent;
  let fixture: ComponentFixture<PortalLoginComponent>;
  let authSpy: jasmine.SpyObj<PortalAuthService>;
  let router: Router;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('PortalAuthService', ['login']);
    authSpy.login.and.returnValue(of({
      token: 'abc', expiresAt: '2026-12-31', patientId: 1, fullName: 'John Doe', email: 'john@test.com'
    }));

    await TestBed.configureTestingModule({
      imports: [PortalLoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: PortalAuthService, useValue: authSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalLoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.loading).toBeFalse();
    expect(component.errorMsg).toBe('');
  });

  it('should call authService.login on submit', () => {
    spyOn(router, 'navigateByUrl');
    component.email = 'test@test.com';
    component.password = 'password123';

    component.onSubmit();

    expect(component.loading).toBeTrue();
    expect(authSpy.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/portal/dashboard');
  });

  it('should navigate to returnUrl if present', () => {
    TestBed.resetTestingModule();
    authSpy.login.and.returnValue(of({
      token: 'abc', expiresAt: '2026-12-31', patientId: 1, fullName: 'John Doe', email: 'john@test.com'
    }));

    TestBed.configureTestingModule({
      imports: [PortalLoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: PortalAuthService, useValue: authSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => key === 'returnUrl' ? '/portal/appointments' : null
              }
            }
          }
        }
      ]
    });

    const fix = TestBed.createComponent(PortalLoginComponent);
    const comp = fix.componentInstance;
    const rtr = TestBed.inject(Router);
    spyOn(rtr, 'navigateByUrl');

    comp.email = 'test@test.com';
    comp.password = 'pass';
    comp.onSubmit();

    expect(rtr.navigateByUrl).toHaveBeenCalledWith('/portal/appointments');
  });

  it('should set errorMsg on login failure', () => {
    authSpy.login.and.returnValue(throwError(() => ({
      error: { message: 'Bad credentials' }
    })));

    component.email = 'test@test.com';
    component.password = 'wrong';
    component.onSubmit();

    expect(component.errorMsg).toBe('Bad credentials');
    expect(component.loading).toBeFalse();
  });

  it('should use default error message when error has no message', () => {
    authSpy.login.and.returnValue(throwError(() => ({})));

    component.email = 'test@test.com';
    component.password = 'wrong';
    component.onSubmit();

    expect(component.errorMsg).toBe('Invalid email or password.');
    expect(component.loading).toBeFalse();
  });

  it('should clear errorMsg before each submit', () => {
    component.errorMsg = 'previous error';
    authSpy.login.and.returnValue(of({
      token: 'abc', expiresAt: '2026-12-31', patientId: 1, fullName: 'John', email: 'j@t.com'
    }));
    spyOn(router, 'navigateByUrl');

    component.onSubmit();

    expect(component.errorMsg).toBe('');
  });
});
