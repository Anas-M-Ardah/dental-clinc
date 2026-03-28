import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AppointmentsComponent } from './appointments.component';
import { ApiService, PagedResult } from '../../core/services/api.service';
import { TranslationService } from '../../core/services/translation.service';
import { Appointment, AppointmentStatus } from '../../core/models/appointment.model';
import { Doctor } from '../../core/models/doctor.model';

describe('AppointmentsComponent', () => {
  let component: AppointmentsComponent;
  let fixture: ComponentFixture<AppointmentsComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;
  let translationSpy: jasmine.SpyObj<TranslationService>;

  const mockAppointments: PagedResult<Appointment> = {
    data: [
      {
        id: 1, patientId: 1, patientName: 'John Doe', doctorId: 1, doctorName: 'Dr. Smith',
        appointmentDate: '2026-03-28', startTime: '09:00', endTime: '09:30',
        treatmentId: 1, treatmentName: 'Cleaning', status: AppointmentStatus.Pending,
        createdAt: '2026-03-27'
      }
    ],
    totalCount: 1,
    pageNumber: 1,
    pageSize: 10
  };

  const mockDoctors: Doctor[] = [
    { id: 1, firstName: 'John', lastName: 'Smith', specialization: 'General', phone: '111', isAvailable: true }
  ];

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('ApiService', ['getAppointments', 'getDoctors', 'deleteAppointment']);
    translationSpy = jasmine.createSpyObj('TranslationService', ['instant'], {
      currentLanguage: 'en'
    });

    apiSpy.getAppointments.and.returnValue(of(mockAppointments));
    apiSpy.getDoctors.and.returnValue(of(mockDoctors));
    apiSpy.deleteAppointment.and.returnValue(of(void 0));
    translationSpy.instant.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [AppointmentsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ApiService, useValue: apiSpy },
        { provide: TranslationService, useValue: translationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.appointments).toEqual([]);
    expect(component.doctors).toEqual([]);
    expect(component.filterDate).toBe('');
    expect(component.filterDoctorId).toBeNull();
    expect(component.filterStatus).toBeNull();
    expect(component.loading).toBeFalse();
  });

  it('should load appointments and doctors on init', () => {
    component.ngOnInit();
    expect(apiSpy.getDoctors).toHaveBeenCalled();
    expect(apiSpy.getAppointments).toHaveBeenCalled();
    expect(component.doctors).toEqual(mockDoctors);
    expect(component.appointments).toEqual(mockAppointments.data);
    expect(component.loading).toBeFalse();
  });

  it('should pass filter parameters when loading appointments', () => {
    component.filterDoctorId = 1;
    component.filterDate = '2026-03-28';
    component.filterStatus = AppointmentStatus.Pending;

    component.loadAppointments();

    expect(apiSpy.getAppointments).toHaveBeenCalledWith(
      1, undefined, '2026-03-28', AppointmentStatus.Pending
    );
  });

  it('should pass undefined for empty filter values', () => {
    component.filterDoctorId = null;
    component.filterDate = '';
    component.filterStatus = null;

    component.loadAppointments();

    expect(apiSpy.getAppointments).toHaveBeenCalledWith(
      undefined, undefined, undefined, undefined
    );
  });

  it('should return correct status classes', () => {
    expect(component.getStatusClass(0)).toBe('bg-secondary');
    expect(component.getStatusClass(1)).toBe('bg-primary');
    expect(component.getStatusClass(2)).toBe('bg-info');
    expect(component.getStatusClass(3)).toBe('bg-success');
    expect(component.getStatusClass(4)).toBe('bg-danger');
    expect(component.getStatusClass(5)).toBe('bg-warning');
    expect(component.getStatusClass(99)).toBe('bg-secondary');
  });

  it('should call translation for getStatusText', () => {
    component.getStatusText(2);
    expect(translationSpy.instant).toHaveBeenCalledWith('appointmentStatus.2');
  });

  it('should cancel appointment after confirmation and reload', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.ngOnInit();
    apiSpy.getAppointments.calls.reset();

    component.cancelAppointment(1);

    expect(apiSpy.deleteAppointment).toHaveBeenCalledWith(1);
    expect(apiSpy.getAppointments).toHaveBeenCalled();
  });

  it('should not cancel if confirmation is declined', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.cancelAppointment(1);
    expect(apiSpy.deleteAppointment).not.toHaveBeenCalled();
  });

  it('should return item.id from trackById', () => {
    expect(component.trackById(0, { id: 77 })).toBe(77);
  });
});
