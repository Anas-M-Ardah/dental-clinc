import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let translationServiceSpy: jasmine.SpyObj<TranslationService>;

  beforeEach(() => {
    translationServiceSpy = jasmine.createSpyObj('TranslationService', ['instant']);

    TestBed.configureTestingModule({
      providers: [
        TranslatePipe,
        { provide: TranslationService, useValue: translationServiceSpy }
      ]
    });

    pipe = TestBed.inject(TranslatePipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should call translationService.instant with the provided key', () => {
    // Arrange
    translationServiceSpy.instant.and.returnValue('Dashboard');

    // Act
    pipe.transform('nav.dashboard');

    // Assert
    expect(translationServiceSpy.instant).toHaveBeenCalledWith('nav.dashboard');
  });

  it('should return the translated value from the service', () => {
    // Arrange
    translationServiceSpy.instant.and.returnValue('Save');

    // Act
    const result = pipe.transform('common.save');

    // Assert
    expect(result).toBe('Save');
  });

  it('should return the key when translation is not found', () => {
    // Arrange
    translationServiceSpy.instant.and.returnValue('unknown.key');

    // Act
    const result = pipe.transform('unknown.key');

    // Assert
    expect(result).toBe('unknown.key');
  });

  it('should return Arabic translation when service returns Arabic', () => {
    // Arrange
    translationServiceSpy.instant.and.returnValue('لوحة التحكم');

    // Act
    const result = pipe.transform('nav.dashboard');

    // Assert
    expect(result).toBe('لوحة التحكم');
  });

  it('should handle empty string key', () => {
    // Arrange
    translationServiceSpy.instant.and.returnValue('');

    // Act
    const result = pipe.transform('');

    // Assert
    expect(result).toBe('');
    expect(translationServiceSpy.instant).toHaveBeenCalledWith('');
  });

  it('should call instant for each transform invocation', () => {
    // Arrange
    translationServiceSpy.instant.and.callFake((key: string) => {
      const map: Record<string, string> = {
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'nav.patients': 'Patients'
      };
      return map[key] || key;
    });

    // Act
    const result1 = pipe.transform('common.save');
    const result2 = pipe.transform('common.cancel');
    const result3 = pipe.transform('nav.patients');

    // Assert
    expect(result1).toBe('Save');
    expect(result2).toBe('Cancel');
    expect(result3).toBe('Patients');
    expect(translationServiceSpy.instant).toHaveBeenCalledTimes(3);
  });

  it('should handle deeply nested translation keys', () => {
    // Arrange
    translationServiceSpy.instant.and.returnValue('Treatment Records');

    // Act
    const result = pipe.transform('treatmentRecords.title');

    // Assert
    expect(result).toBe('Treatment Records');
    expect(translationServiceSpy.instant).toHaveBeenCalledWith('treatmentRecords.title');
  });

  it('should handle numeric-like keys for status translations', () => {
    // Arrange
    translationServiceSpy.instant.and.returnValue('Pending');

    // Act
    const result = pipe.transform('appointmentStatus.0');

    // Assert
    expect(result).toBe('Pending');
    expect(translationServiceSpy.instant).toHaveBeenCalledWith('appointmentStatus.0');
  });
});
