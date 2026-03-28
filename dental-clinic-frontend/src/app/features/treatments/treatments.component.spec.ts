import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { TreatmentsComponent } from './treatments.component';
import { ApiService } from '../../core/services/api.service';
import { TranslationService } from '../../core/services/translation.service';
import { Treatment } from '../../core/models/treatment.model';

describe('TreatmentsComponent', () => {
  let component: TreatmentsComponent;
  let fixture: ComponentFixture<TreatmentsComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const mockTreatments: Treatment[] = [
    { id: 1, name: 'Cleaning', description: 'Dental cleaning', price: 100, durationMinutes: 30, isActive: true },
    { id: 2, name: 'Filling', description: 'Tooth filling', price: 200, durationMinutes: 45, isActive: true }
  ];

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('ApiService', ['getTreatments']);
    apiSpy.getTreatments.and.returnValue(of(mockTreatments));

    await TestBed.configureTestingModule({
      imports: [TreatmentsComponent],
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

    fixture = TestBed.createComponent(TreatmentsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty treatments and loading false', () => {
    expect(component.treatments).toEqual([]);
    expect(component.loading).toBeFalse();
  });

  it('should load treatments on init', () => {
    component.ngOnInit();
    expect(apiSpy.getTreatments).toHaveBeenCalled();
    expect(component.treatments).toEqual(mockTreatments);
    expect(component.loading).toBeFalse();
  });

  it('should handle error and set loading false', () => {
    apiSpy.getTreatments.and.returnValue(throwError(() => new Error('fail')));
    component.ngOnInit();
    expect(component.loading).toBeFalse();
    expect(component.treatments).toEqual([]);
  });

  it('should return item.id from trackById', () => {
    expect(component.trackById(0, { id: 5 })).toBe(5);
  });
});
