import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';
import { TranslationService } from '../../core/services/translation.service';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let translationSpy: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    translationSpy = jasmine.createSpyObj('TranslationService', ['instant', 'setLanguage'], {
      currentLanguage: 'en'
    });
    translationSpy.instant.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        { provide: TranslationService, useValue: translationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize currentLang from TranslationService', () => {
    expect(component.currentLang).toBe('en');
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

  it('should toggle language from en to ar', () => {
    component.currentLang = 'en';
    component.toggleLanguage();

    expect(translationSpy.setLanguage).toHaveBeenCalledWith('ar');
    expect(component.currentLang).toBe('ar');
  });

  it('should toggle language from ar to en', () => {
    component.currentLang = 'ar';
    component.toggleLanguage();

    expect(translationSpy.setLanguage).toHaveBeenCalledWith('en');
    expect(component.currentLang).toBe('en');
  });
});
