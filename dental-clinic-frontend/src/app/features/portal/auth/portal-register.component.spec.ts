import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PortalRegisterComponent } from './portal-register.component';
import { PortalAuthService } from '../../../core/services/portal-auth.service';
import { Gender } from '../../../core/models/patient.model';

describe('PortalRegisterComponent', () => {
  let component: PortalRegisterComponent;
  let fixture: ComponentFixture<PortalRegisterComponent>;
  let authSpy: jasmine.SpyObj<PortalAuthService>;
  let router: Router;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('PortalAuthService', ['register']);
    authSpy.register.and.returnValue(of({
      token: 'abc', expiresAt: '2026-12-31', patientId: 1, fullName: 'John Doe', email: 'john@test.com'
    }));

    await TestBed.configureTestingModule({
      imports: [PortalRegisterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: PortalAuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalRegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default dto values', () => {
    expect(component.dto.firstName).toBe('');
    expect(component.dto.lastName).toBe('');
    expect(component.dto.email).toBe('');
    expect(component.dto.phone).toBe('');
    expect(component.dto.dateOfBirth).toBe('');
    expect(component.dto.gender).toBe(Gender.Male);
    expect(component.dto.password).toBe('');
    expect(component.loading).toBeFalse();
    expect(component.errorMsg).toBe('');
  });

  it('should expose Gender enum', () => {
    expect(component.Gender).toBe(Gender);
  });

  it('should call authService.register on submit and navigate to dashboard', () => {
    spyOn(router, 'navigate');
    component.dto = {
      firstName: 'John', lastName: 'Doe', email: 'john@test.com',
      phone: '123', dateOfBirth: '1990-01-01', gender: Gender.Male, password: 'password123'
    };

    component.onSubmit();

    expect(component.loading).toBeTrue();
    expect(authSpy.register).toHaveBeenCalledWith(component.dto);
    expect(router.navigate).toHaveBeenCalledWith(['/portal/dashboard']);
  });

  it('should set errorMsg on registration failure', () => {
    authSpy.register.and.returnValue(throwError(() => ({
      error: { message: 'Email already exists' }
    })));

    component.onSubmit();

    expect(component.errorMsg).toBe('Email already exists');
    expect(component.loading).toBeFalse();
  });

  it('should use default error message when error has no message', () => {
    authSpy.register.and.returnValue(throwError(() => ({})));

    component.onSubmit();

    expect(component.errorMsg).toBe('Registration failed. Please try again.');
    expect(component.loading).toBeFalse();
  });

  it('should clear errorMsg before each submit', () => {
    component.errorMsg = 'previous error';
    spyOn(router, 'navigate');

    component.onSubmit();

    expect(component.errorMsg).toBe('');
  });
});
