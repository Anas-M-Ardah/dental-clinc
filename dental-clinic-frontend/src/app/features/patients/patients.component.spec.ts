import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PatientsComponent } from './patients.component';
import { ApiService, PagedResult } from '../../core/services/api.service';
import { TranslationService } from '../../core/services/translation.service';
import { Patient, Gender } from '../../core/models/patient.model';

describe('PatientsComponent', () => {
  let component: PatientsComponent;
  let fixture: ComponentFixture<PatientsComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;
  let translationSpy: jasmine.SpyObj<TranslationService>;

  const mockPatients: PagedResult<Patient> = {
    data: [
      {
        id: 1, firstName: 'John', lastName: 'Doe', phone: '123',
        dateOfBirth: '1990-01-01', gender: Gender.Male, createdAt: '2026-01-01'
      },
      {
        id: 2, firstName: 'Jane', lastName: 'Smith', phone: '456',
        dateOfBirth: '1985-05-15', gender: Gender.Female, createdAt: '2026-01-02'
      }
    ],
    totalCount: 2,
    pageNumber: 1,
    pageSize: 10
  };

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('ApiService', ['getPatients', 'deletePatient']);
    translationSpy = jasmine.createSpyObj('TranslationService', ['instant'], {
      currentLanguage: 'en'
    });

    apiSpy.getPatients.and.returnValue(of(mockPatients));
    apiSpy.deletePatient.and.returnValue(of(void 0));
    translationSpy.instant.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [PatientsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ApiService, useValue: apiSpy },
        { provide: TranslationService, useValue: translationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.patients).toEqual([]);
    expect(component.searchTerm).toBe('');
    expect(component.pageNumber).toBe(1);
    expect(component.pageSize).toBe(10);
    expect(component.totalCount).toBe(0);
    expect(component.loading).toBeFalse();
  });

  it('should load patients on ngOnInit', () => {
    component.ngOnInit();
    expect(apiSpy.getPatients).toHaveBeenCalledWith('', 1, 10);
    expect(component.patients).toEqual(mockPatients.data);
    expect(component.totalCount).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('should compute totalPages correctly', () => {
    component.totalCount = 25;
    component.pageSize = 10;
    expect(component.totalPages).toBe(3);
  });

  it('should compute pageNumbers correctly', () => {
    component.totalCount = 25;
    component.pageSize = 10;
    expect(component.pageNumbers).toEqual([1, 2, 3]);
  });

  it('should return 0 totalPages when totalCount is 0', () => {
    component.totalCount = 0;
    expect(component.totalPages).toBe(0);
    expect(component.pageNumbers).toEqual([]);
  });

  it('should debounce search and reload patients', fakeAsync(() => {
    component.ngOnInit();
    apiSpy.getPatients.calls.reset();

    component.searchTerm = 'test';
    component.onSearchChange('test');
    tick(200);
    expect(apiSpy.getPatients).not.toHaveBeenCalled();

    tick(100);
    expect(apiSpy.getPatients).toHaveBeenCalledWith('test', 1, 10);
  }));

  it('should not reload on duplicate search term', fakeAsync(() => {
    component.ngOnInit();
    apiSpy.getPatients.calls.reset();

    component.onSearchChange('test');
    tick(300);
    expect(apiSpy.getPatients).toHaveBeenCalledTimes(1);

    component.onSearchChange('test');
    tick(300);
    expect(apiSpy.getPatients).toHaveBeenCalledTimes(1);
  }));

  it('should reset to page 1 on search', fakeAsync(() => {
    component.ngOnInit();
    component.pageNumber = 3;
    apiSpy.getPatients.calls.reset();

    component.onSearchChange('new');
    tick(300);

    expect(component.pageNumber).toBe(1);
  }));

  it('should navigate to valid page', () => {
    component.ngOnInit();
    component.totalCount = 30;
    apiSpy.getPatients.calls.reset();

    component.goToPage(2);
    expect(component.pageNumber).toBe(2);
    expect(apiSpy.getPatients).toHaveBeenCalled();
  });

  it('should not navigate to page below 1', () => {
    component.ngOnInit();
    component.totalCount = 30;
    apiSpy.getPatients.calls.reset();

    component.goToPage(0);
    expect(apiSpy.getPatients).not.toHaveBeenCalled();
  });

  it('should not navigate beyond totalPages', () => {
    component.ngOnInit();
    component.totalCount = 20;
    apiSpy.getPatients.calls.reset();

    component.goToPage(5);
    expect(apiSpy.getPatients).not.toHaveBeenCalled();
  });

  it('should delete patient after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.ngOnInit();
    apiSpy.getPatients.calls.reset();

    component.deletePatient(1);
    expect(apiSpy.deletePatient).toHaveBeenCalledWith(1);
    expect(apiSpy.getPatients).toHaveBeenCalled();
  });

  it('should not delete patient if confirmation cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deletePatient(1);
    expect(apiSpy.deletePatient).not.toHaveBeenCalled();
  });

  it('should return item.id from trackById', () => {
    expect(component.trackById(0, { id: 7 })).toBe(7);
  });

  it('should return index from trackByIndex', () => {
    expect(component.trackByIndex(3)).toBe(3);
  });
});
