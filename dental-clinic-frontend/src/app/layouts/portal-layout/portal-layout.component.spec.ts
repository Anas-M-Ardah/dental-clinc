import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PortalLayoutComponent } from './portal-layout.component';
import { PortalAuthService } from '../../core/services/portal-auth.service';

describe('PortalLayoutComponent', () => {
  let component: PortalLayoutComponent;
  let fixture: ComponentFixture<PortalLayoutComponent>;
  let authSpy: jasmine.SpyObj<PortalAuthService>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('PortalAuthService', ['getFullName', 'logout']);
    authSpy.getFullName.and.returnValue('Jane Doe');

    await TestBed.configureTestingModule({
      imports: [PortalLayoutComponent],
      providers: [
        provideRouter([]),
        { provide: PortalAuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set patientName from authService.getFullName', () => {
    expect(component.patientName).toBe('Jane Doe');
    expect(authSpy.getFullName).toHaveBeenCalled();
  });

  it('should initialize sidebarCollapsed to false', () => {
    expect(component.sidebarCollapsed).toBeFalse();
  });

  it('should toggle sidebar', () => {
    expect(component.sidebarCollapsed).toBeFalse();

    component.toggleSidebar();
    expect(component.sidebarCollapsed).toBeTrue();

    component.toggleSidebar();
    expect(component.sidebarCollapsed).toBeFalse();
  });

  it('should call authService.logout on logout', () => {
    component.logout();
    expect(authSpy.logout).toHaveBeenCalled();
  });
});
