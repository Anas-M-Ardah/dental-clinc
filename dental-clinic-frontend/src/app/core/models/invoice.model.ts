export enum InvoiceStatus {
  Pending = 0,
  Paid = 1,
  Cancelled = 2,
  Refunded = 3
}

export interface InvoiceItem {
  id: number;
  treatmentName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  patientId: number;
  patientName: string;
  appointmentId?: number;
  totalAmount: number;
  status: InvoiceStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  paidAt?: string;
  items: InvoiceItem[];
}

export interface CreateInvoiceDto {
  patientId: number;
  appointmentId?: number;
  items: { treatmentId: number; quantity: number }[];
}

export interface PayInvoiceDto {
  paymentMethod?: string;
  notes?: string;
}
