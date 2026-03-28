import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ApiService, DashboardStats, TodaySchedule } from '../../core/services/api.service';
import { TranslationService } from '../../core/services/translation.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;
  let translationSpy: jasmine.SpyObj<TranslationService>;

  const mockStats: DashboardStats = {
    todayAppointments: 5,
    totalPatients: 120,
    monthlyRevenue: 15000,
    pendingInvoices: 8,
    cancelledToday: 1
  };

  const mockSchedule: TodaySchedule = {
    date: '2026-03-28',
    appointments: [
      {
        id: 1, patientId: 1, patientName: 'John Doe', doctorId: 1, doctorName: 'Dr. Smith',
        appointmentDate: '2026-03-28', startTime: '09:00', endTime: '09:30',
        treatmentId: 1, treatmentName: 'Cleaning', status: 0, createdAt: '2026-03-27'
      }
    ]
  };

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('ApiService', ['getDashboardStats', 'getTodaySchedule']);
    translationSpy = jasmine.createSpyObj('TranslationService', ['instant'], {
      currentLanguage: 'en'
    });

    apiSpy.getDashboardStats.and.returnValue(of(mockStats));
    apiSpy.getTodaySchedule.and.returnValue(of(mockSchedule));
    translationSpy.instant.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ApiService, useValue: apiSpy },
        { provide: TranslationService, useValue: translationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loading true', () => {
    expect(component.loading).toBeTrue();
  });

  it('should set currentLang from TranslationService', () => {
    expect(component.currentLang).toBe('en');
  });

  it('should call loadData on ngOnInit', () => {
    spyOn(component, 'loadData');
    component.ngOnInit();
    expect(component.loadData).toHaveBeenCalled();
  });

  it('should load dashboard stats and schedule on loadData', () => {
    component.loadData();
    expect(apiSpy.getDashboardStats).toHaveBeenCalled();
    expect(apiSpy.getTodaySchedule).toHaveBeenCalled();
    expect(component.stats).toEqual(mockStats);
    expect(component.todaySchedule).toEqual(mockSchedule);
    expect(component.loading).toBeFalse();
  });

  it('should handle stats error gracefully', () => {
    apiSpy.getDashboardStats.and.returnValue(throwError(() => new Error('fail')));
    component.loadData();
    expect(component.stats).toBeNull();
  });

  it('should handle schedule error and set loading false', () => {
    apiSpy.getTodaySchedule.and.returnValue(throwError(() => new Error('fail')));
    component.loadData();
    expect(component.loading).toBeFalse();
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

  it('should call translation.instant for getStatusText', () => {
    const result = component.getStatusText(1);
    expect(translationSpy.instant).toHaveBeenCalledWith('appointmentStatus.1');
    expect(result).toBe('appointmentStatus.1');
  });

  it('should return item.id from trackById', () => {
    expect(component.trackById(0, { id: 42 })).toBe(42);
  });
});
