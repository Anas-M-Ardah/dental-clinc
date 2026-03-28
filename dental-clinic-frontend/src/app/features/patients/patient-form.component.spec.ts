import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PatientFormComponent } from './patient-form.component';
import { ApiService } from '../../core/services/api.service';
import { TranslationService } from '../../core/services/translation.service';
import { Gender, Patient } from '../../core/models/patient.model';

describe('PatientFormComponent', () => {
  let component: PatientFormComponent;
  let fixture: ComponentFixture<PatientFormComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;
  let router: Router;

  const mockPatient: Patient = {
    id: 1, firstName: 'John', lastName: 'Doe', phone: '123',
    email: 'john@test.com', dateOfBirth: '1990-01-01T00:00:00',
    gender: Gender.Male, address: '123 St', medicalHistory: 'None',
    createdAt: '2026-01-01'
  };

  function createComponent(routeParams: { [key: string]: string } = {}) {
    TestBed.configureTestingModule({
      imports: [PatientFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ApiService, useValue: apiSpy },
        {
          provide: TranslationService,
          useValue: jasmine.createSpyObj('TranslationService', ['instant'], { currentLanguage: 'en' })
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: routeParams } }
        }
      ]
    });

    fixture = TestBed.createComponent(PatientFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', [
      'getPatient', 'createPatient', 'updatePatient'
    ]);
    apiSpy.getPatient.and.returnValue(of(mockPatient));
    apiSpy.createPatient.and.returnValue(of(mockPatient));
    apiSpy.updatePatient.and.returnValue(of(mockPatient));
  });

  describe('create mode', () => {
    beforeEach(() => {
      createComponent({});
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty patient and isEdit false', () => {
      component.ngOnInit();
      expect(component.isEdit).toBeFalse();
      expect(component.patientId).toBeNull();
      expect(component.patient.firstName).toBe('');
      expect(component.patient.gender).toBe(Gender.Male);
    });

    it('should not load patient data in create mode', () => {
      component.ngOnInit();
      expect(apiSpy.getPatient).not.toHaveBeenCalled();
    });

    it('should call createPatient on submit and navigate to /patients', () => {
      spyOn(router, 'navigate');
      component.ngOnInit();
      component.patient.firstName = 'New';
      component.patient.lastName = 'Patient';
      component.patient.phone = '555';
      component.patient.dateOfBirth = '2000-01-01';

      component.onSubmit();

      expect(component.submitting).toBeTrue();
      expect(apiSpy.createPatient).toHaveBeenCalledWith(component.patient);
      expect(router.navigate).toHaveBeenCalledWith(['/patients']);
    });

    it('should reset submitting on error', () => {
      apiSpy.createPatient.and.returnValue(throwError(() => new Error('fail')));
      component.ngOnInit();

      component.onSubmit();

      expect(component.submitting).toBeFalse();
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      createComponent({ id: '1' });
    });

    it('should set isEdit true and load patient', () => {
      component.ngOnInit();
      expect(component.isEdit).toBeTrue();
      expect(component.patientId).toBe(1);
      expect(apiSpy.getPatient).toHaveBeenCalledWith(1);
      expect(component.patient.firstName).toBe('John');
      expect(component.patient.dateOfBirth).toBe('1990-01-01');
    });

    it('should call updatePatient on submit', () => {
      spyOn(router, 'navigate');
      component.ngOnInit();

      component.onSubmit();

      expect(apiSpy.updatePatient).toHaveBeenCalledWith(1, component.patient as any);
      expect(router.navigate).toHaveBeenCalledWith(['/patients']);
    });
  });
});
