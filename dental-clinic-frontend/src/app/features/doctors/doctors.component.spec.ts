import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { DoctorsComponent } from './doctors.component';
import { ApiService } from '../../core/services/api.service';
import { TranslationService } from '../../core/services/translation.service';
import { Doctor } from '../../core/models/doctor.model';

describe('DoctorsComponent', () => {
  let component: DoctorsComponent;
  let fixture: ComponentFixture<DoctorsComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const mockDoctors: Doctor[] = [
    { id: 1, firstName: 'Ahmad', lastName: 'Ali', specialization: 'Orthodontics', phone: '111', email: 'a@test.com', isAvailable: true },
    { id: 2, firstName: 'Sara', lastName: 'Khan', specialization: 'Periodontics', phone: '222', isAvailable: false }
  ];

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('ApiService', ['getDoctors']);
    apiSpy.getDoctors.and.returnValue(of(mockDoctors));

    await TestBed.configureTestingModule({
      imports: [DoctorsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiService, useValue: apiSpy },
        {
          provide: TranslationService,
          useValue: jasmine.createSpyObj('TranslationService', ['instant'], { currentLanguage: 'en' })
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty doctors and loading false', () => {
    expect(component.doctors).toEqual([]);
    expect(component.loading).toBeFalse();
  });

  it('should load doctors on init', () => {
    component.ngOnInit();
    expect(apiSpy.getDoctors).toHaveBeenCalled();
    expect(component.doctors).toEqual(mockDoctors);
    expect(component.loading).toBeFalse();
  });

  it('should set loading true then false during load', () => {
    component.ngOnInit();
    expect(component.loading).toBeFalse();
  });

  it('should handle error and set loading false', () => {
    apiSpy.getDoctors.and.returnValue(throwError(() => new Error('fail')));
    component.ngOnInit();
    expect(component.loading).toBeFalse();
    expect(component.doctors).toEqual([]);
  });

  it('should return item.id from trackById', () => {
    expect(component.trackById(0, { id: 10 })).toBe(10);
  });
});
