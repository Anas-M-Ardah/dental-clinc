import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { BillingComponent } from './billing.component';
import { ApiService, PagedResult } from '../../core/services/api.service';
import { TranslationService } from '../../core/services/translation.service';
import { Invoice, InvoiceStatus } from '../../core/models/invoice.model';

describe('BillingComponent', () => {
  let component: BillingComponent;
  let fixture: ComponentFixture<BillingComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;
  let translationSpy: jasmine.SpyObj<TranslationService>;

  const mockInvoices: PagedResult<Invoice> = {
    data: [
      {
        id: 1, invoiceNumber: 'INV-001', patientId: 1, patientName: 'John Doe',
        totalAmount: 500, status: InvoiceStatus.Pending, createdAt: '2026-03-01',
        items: [{ id: 1, treatmentName: 'Cleaning', quantity: 1, unitPrice: 500, totalPrice: 500 }]
      },
      {
        id: 2, invoiceNumber: 'INV-002', patientId: 2, patientName: 'Jane Smith',
        totalAmount: 1000, status: InvoiceStatus.Paid, createdAt: '2026-03-02',
        items: [{ id: 2, treatmentName: 'Filling', quantity: 2, unitPrice: 500, totalPrice: 1000 }]
      }
    ],
    totalCount: 2,
    pageNumber: 1,
    pageSize: 10
  };

  const mockPaidInvoice: Invoice = { ...mockInvoices.data[0], status: InvoiceStatus.Paid };

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('ApiService', ['getInvoices', 'payInvoice']);
    translationSpy = jasmine.createSpyObj('TranslationService', ['instant'], {
      currentLanguage: 'en'
    });

    apiSpy.getInvoices.and.returnValue(of(mockInvoices));
    apiSpy.payInvoice.and.returnValue(of(mockPaidInvoice));
    translationSpy.instant.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [BillingComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiService, useValue: apiSpy },
        { provide: TranslationService, useValue: translationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BillingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.invoices).toEqual([]);
    expect(component.filterStatus).toBeNull();
    expect(component.selectedInvoice).toBeNull();
    expect(component.loading).toBeFalse();
  });

  it('should load invoices on init', () => {
    component.ngOnInit();
    expect(apiSpy.getInvoices).toHaveBeenCalledWith(undefined, undefined);
    expect(component.invoices).toEqual(mockInvoices.data);
    expect(component.loading).toBeFalse();
  });

  it('should pass filterStatus when loading invoices', () => {
    component.filterStatus = InvoiceStatus.Paid;
    component.loadInvoices();
    expect(apiSpy.getInvoices).toHaveBeenCalledWith(undefined, InvoiceStatus.Paid);
  });

  it('should return correct status classes', () => {
    expect(component.getStatusClass(0)).toBe('bg-warning');
    expect(component.getStatusClass(1)).toBe('bg-success');
    expect(component.getStatusClass(2)).toBe('bg-danger');
    expect(component.getStatusClass(3)).toBe('bg-info');
    expect(component.getStatusClass(99)).toBe('bg-secondary');
  });

  it('should call translation for getStatusText', () => {
    const result = component.getStatusText(0);
    expect(translationSpy.instant).toHaveBeenCalledWith('invoiceStatus.0');
    expect(result).toBe('invoiceStatus.0');
  });

  it('should set selectedInvoice on viewInvoice', () => {
    const invoice = mockInvoices.data[0];
    component.viewInvoice(invoice);
    expect(component.selectedInvoice).toBe(invoice);
  });

  it('should pay invoice after confirmation and reload', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.ngOnInit();
    component.selectedInvoice = mockInvoices.data[0];
    apiSpy.getInvoices.calls.reset();

    component.payInvoice(1);

    expect(apiSpy.payInvoice).toHaveBeenCalledWith(1, { paymentMethod: 'Cash' });
    expect(apiSpy.getInvoices).toHaveBeenCalled();
    expect(component.selectedInvoice).toBeNull();
  });

  it('should not pay invoice if confirmation cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.payInvoice(1);
    expect(apiSpy.payInvoice).not.toHaveBeenCalled();
  });

  it('should return item.id from trackById', () => {
    expect(component.trackById(0, { id: 99 })).toBe(99);
  });
});
