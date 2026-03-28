import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    // Clear localStorage and reset document attributes before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [TranslationService]
    });
    service = TestBed.inject(TranslationService);
  });

  afterEach(() => {
    localStorage.clear();
    // Reset document direction
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===================== CURRENT LANGUAGE =====================

  describe('currentLanguage', () => {
    it('should default to "en" when no language is saved', () => {
      expect(service.currentLanguage).toBe('en');
    });

    it('should use saved language from localStorage', () => {
      localStorage.setItem('language', 'ar');
      // Re-create service to pick up saved language
      service = new TranslationService();

      expect(service.currentLanguage).toBe('ar');
    });

    it('should update after setLanguage is called', () => {
      service.setLanguage('ar');

      expect(service.currentLanguage).toBe('ar');
    });
  });

  // ===================== IS RTL =====================

  describe('isRTL', () => {
    it('should return false for English', () => {
      service.setLanguage('en');

      expect(service.isRTL).toBeFalse();
    });

    it('should return true for Arabic', () => {
      service.setLanguage('ar');

      expect(service.isRTL).toBeTrue();
    });

    it('should return false for any non-Arabic language', () => {
      service.setLanguage('fr');

      expect(service.isRTL).toBeFalse();
    });
  });

  // ===================== SET LANGUAGE =====================

  describe('setLanguage', () => {
    it('should update currentLanguage', () => {
      service.setLanguage('ar');

      expect(service.currentLanguage).toBe('ar');
    });

    it('should save language to localStorage', () => {
      service.setLanguage('ar');

      expect(localStorage.getItem('language')).toBe('ar');
    });

    it('should set document dir to rtl for Arabic', () => {
      service.setLanguage('ar');

      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should set document dir to ltr for English', () => {
      service.setLanguage('ar');
      service.setLanguage('en');

      expect(document.documentElement.dir).toBe('ltr');
    });

    it('should set document lang attribute', () => {
      service.setLanguage('ar');

      expect(document.documentElement.lang).toBe('ar');
    });

    it('should load Arabic translations when set to ar', () => {
      service.setLanguage('ar');

      expect(service.translate('nav.dashboard')).toBe('لوحة التحكم');
    });

    it('should load English translations when set to en', () => {
      service.setLanguage('ar');
      service.setLanguage('en');

      expect(service.translate('nav.dashboard')).toBe('Dashboard');
    });
  });

  // ===================== TRANSLATE =====================

  describe('translate', () => {
    it('should return English translation for nav.dashboard', () => {
      expect(service.translate('nav.dashboard')).toBe('Dashboard');
    });

    it('should return English translation for common.save', () => {
      expect(service.translate('common.save')).toBe('Save');
    });

    it('should return English translation for common.cancel', () => {
      expect(service.translate('common.cancel')).toBe('Cancel');
    });

    it('should return English translation for common.delete', () => {
      expect(service.translate('common.delete')).toBe('Delete');
    });

    it('should return English translation for patients.title', () => {
      expect(service.translate('patients.title')).toBe('Patients');
    });

    it('should return English translation for appointments.title', () => {
      expect(service.translate('appointments.title')).toBe('Appointments');
    });

    it('should return English translation for billing.title', () => {
      expect(service.translate('billing.title')).toBe('Billing');
    });

    it('should return English translation for appointmentStatus.0', () => {
      expect(service.translate('appointmentStatus.0')).toBe('Pending');
    });

    it('should return English translation for invoiceStatus.1', () => {
      expect(service.translate('invoiceStatus.1')).toBe('Paid');
    });

    it('should return the key itself when translation is not found', () => {
      expect(service.translate('nonexistent.key')).toBe('nonexistent.key');
    });

    it('should return the key for completely unknown keys', () => {
      expect(service.translate('foo.bar.baz')).toBe('foo.bar.baz');
    });

    it('should return Arabic translation for nav.dashboard', () => {
      service.setLanguage('ar');

      expect(service.translate('nav.dashboard')).toBe('لوحة التحكم');
    });

    it('should return Arabic translation for common.save', () => {
      service.setLanguage('ar');

      expect(service.translate('common.save')).toBe('حفظ');
    });

    it('should return Arabic translation for patients.title', () => {
      service.setLanguage('ar');

      expect(service.translate('patients.title')).toBe('المرضى');
    });

    it('should return Arabic translation for nav.clinicName', () => {
      service.setLanguage('ar');

      expect(service.translate('nav.clinicName')).toBe('عيادة طب الأسنان');
    });

    it('should return the key for missing translations in Arabic', () => {
      service.setLanguage('ar');

      expect(service.translate('nonexistent.key')).toBe('nonexistent.key');
    });
  });

  // ===================== INSTANT =====================

  describe('instant', () => {
    it('should return the same result as translate', () => {
      expect(service.instant('nav.dashboard')).toBe(service.translate('nav.dashboard'));
    });

    it('should return English translation', () => {
      expect(service.instant('common.search')).toBe('Search');
    });

    it('should return Arabic translation when language is Arabic', () => {
      service.setLanguage('ar');

      expect(service.instant('common.search')).toBe('بحث');
    });

    it('should return the key when translation is not found', () => {
      expect(service.instant('missing.key')).toBe('missing.key');
    });
  });

  // ===================== NESTED TRANSLATIONS =====================

  describe('nested translation flattening', () => {
    it('should flatten common translations', () => {
      expect(service.translate('common.loading')).toBe('Loading...');
      expect(service.translate('common.noData')).toBe('No data found');
      expect(service.translate('common.required')).toBe('Required');
    });

    it('should flatten dashboard translations', () => {
      expect(service.translate('dashboard.todaysAppointments')).toBe("Today's Appointments");
      expect(service.translate('dashboard.totalPatients')).toBe('Total Patients');
      expect(service.translate('dashboard.monthlyRevenue')).toBe('Monthly Revenue');
    });

    it('should flatten treatmentRecords translations', () => {
      expect(service.translate('treatmentRecords.title')).toBe('Treatment Records');
      expect(service.translate('treatmentRecords.chiefComplaint')).toBe('Chief Complaint & Symptoms');
    });

    it('should flatten doctors translations', () => {
      expect(service.translate('doctors.specialization')).toBe('Specialization');
      expect(service.translate('doctors.available')).toBe('Available');
    });

    it('should flatten treatments translations', () => {
      expect(service.translate('treatments.duration')).toBe('Duration');
      expect(service.translate('treatments.minutes')).toBe('min');
    });
  });
});
