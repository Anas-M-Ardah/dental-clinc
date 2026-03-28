import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PortalDashboardComponent } from './portal-dashboard.component';
import { PortalApiService } from '../../../core/services/portal-api.service';
import { AppointmentStatus } from '../../../core/models/appointment.model';
import { PagedResult } from '../../../core/services/api.service';

describe('PortalDashboardComponent', () => {
  let component: PortalDashboardComponent;
  let fixture: ComponentFixture<PortalDashboardComponent>;
  let portalApiSpy: jasmine.SpyObj<PortalApiService>;

  const mockAppointmentsResult: PagedResult<any> = {
    data: [
      {
        id: 1, patientId: 1, patientName: 'John Doe', doctorId: 1, doctorName: 'Dr. Smith',
        appointmentDate: '2026-04-01', startTime: '10:00', endTime: '10:30',
        treatmentId: 1, treatmentName: 'Cleaning', status: AppointmentStatus.Pending,
        createdAt: '2026-03-28'
      }
    ],
    totalCount: 3,
    pageNumber: 1,
    pageSize: 5
  };

  const mockInvoicesResult: PagedResult<any> = {
    data: [],
    totalCount: 2,
    pageNumber: 1,
    pageSize: 1
  };

  beforeEach(async () => {
    portalApiSpy = jasmine.createSpyObj('PortalApiService', ['getMyAppointments', 'getMyInvoices']);
    portalApiSpy.getMyAppointments.and.returnValue(of(mockAppointmentsResult));
    portalApiSpy.getMyInvoices.and.returnValue(of(mockInvoicesResult));

    await TestBed.configureTestingModule({
      imports: [PortalDashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: PortalApiService, useValue: portalApiSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.upcomingAppointments).toEqual([]);
    expect(component.upcomingCount).toBe(0);
    expect(component.pendingInvoiceCount).toBe(0);
  });

  it('should load appointments and invoices on init', () => {
    component.ngOnInit();

    expect(portalApiSpy.getMyAppointments).toHaveBeenCalledWith(AppointmentStatus.Pending, 1, 5);
    expect(portalApiSpy.getMyInvoices).toHaveBeenCalledWith(0, 1, 1);
  });

  it('should populate upcomingAppointments and upcomingCount from response', () => {
    component.ngOnInit();

    expect(component.upcomingAppointments).toEqual(mockAppointmentsResult.data);
    expect(component.upcomingCount).toBe(3);
  });

  it('should populate pendingInvoiceCount from invoices response', () => {
    component.ngOnInit();

    expect(component.pendingInvoiceCount).toBe(2);
  });
});
