export enum InvoiceStatus {
  Pending = 0,
  Paid = 1,
  Cancelled = 2,
  Refunded = 3,
  PartiallyPaid = 4,
  Overdue = 5
}

export enum PaymentStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
  Refunded = 3
}

export interface InvoiceItem {
  id: number;
  treatmentName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentTransaction {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  gatewayResponse?: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  patientId: number;
  patientName: string;
  appointmentId?: number;
  totalAmount: number;
  discountAmount: number;
  paidAmount: number;
  balanceDue: number;
  couponId?: number;
  couponCode?: string;
  status: InvoiceStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  paidAt?: string;
  dueDate?: string;
  items: InvoiceItem[];
  payments: PaymentTransaction[];
}

export interface CreateInvoiceDto {
  patientId: number;
  appointmentId?: number;
  couponCode?: string;
  dueDate?: string;
  items: { treatmentId: number; quantity: number }[];
}

export interface PayInvoiceDto {
  paymentMethod?: string;
  notes?: string;
}

export interface MakePaymentDto {
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

export interface RefundPaymentDto {
  amount: number;
  reason?: string;
}

export interface PortalPaymentDto {
  amount: number;
  paymentMethod: string;
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  isPercentage: boolean;
  discountValue: number;
  maxDiscountAmount?: number;
  minInvoiceAmount?: number;
  maxUsageCount?: number;
  currentUsageCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface CreateCouponDto {
  code: string;
  description: string;
  isPercentage: boolean;
  discountValue: number;
  maxDiscountAmount?: number;
  minInvoiceAmount?: number;
  maxUsageCount?: number;
  expiresAt?: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  errorMessage?: string;
  discountAmount: number;
  coupon?: Coupon;
}
