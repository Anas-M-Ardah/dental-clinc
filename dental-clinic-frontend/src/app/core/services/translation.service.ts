import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: { [key: string]: string } = {};
  private currentLang = new BehaviorSubject<string>('en');

  private enTranslations: { [key: string]: any } = {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      close: "Close",
      search: "Search",
      filter: "Filter",
      actions: "Actions",
      loading: "Loading...",
      noData: "No data found",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
      all: "All",
      status: "Status",
      date: "Date",
      time: "Time",
      name: "Name",
      phone: "Phone",
      email: "Email",
      address: "Address",
      price: "Price",
      total: "Total",
      back: "Back",
      next: "Next",
      previous: "Previous",
      required: "Required"
    },
    nav: {
      dashboard: "Dashboard",
      patients: "Patients",
      appointments: "Appointments",
      doctors: "Doctors",
      treatments: "Treatments",
      billing: "Billing",
      treatmentRecords: "Treatment Records",
      clinicName: "Dental Clinic",
      clinicManagement: "Dental Clinic Management"
    },
    dashboard: {
      title: "Dashboard",
      todaysAppointments: "Today's Appointments",
      totalPatients: "Total Patients",
      monthlyRevenue: "Monthly Revenue",
      pendingInvoices: "Pending Invoices",
      todaysSchedule: "Today's Schedule",
      viewAll: "View All",
      quickActions: "Quick Actions",
      newPatient: "New Patient",
      newAppointment: "New Appointment",
      viewInvoices: "View Invoices",
      noAppointmentsToday: "No appointments scheduled for today."
    },
    patients: {
      title: "Patients",
      addPatient: "Add Patient",
      editPatient: "Edit Patient",
      newPatient: "New Patient",
      searchPlaceholder: "Search patients...",
      firstName: "First Name",
      lastName: "Last Name",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      male: "Male",
      female: "Female",
      medicalHistory: "Medical History",
      deleteConfirm: "Are you sure you want to delete this patient?",
      noPatients: "No patients found."
    },
    appointments: {
      title: "Appointments",
      newAppointment: "New Appointment",
      patient: "Patient",
      doctor: "Doctor",
      treatment: "Treatment",
      selectPatient: "Select Patient",
      selectDoctor: "Select Doctor",
      selectTreatment: "Select Treatment",
      allDoctors: "All Doctors",
      pending: "Pending",
      confirmed: "Confirmed",
      inProgress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
      noShow: "No Show",
      cancelAppointment: "Cancel Appointment",
      cancelConfirm: "Are you sure you want to cancel this appointment?",
      noAppointments: "No appointments found.",
      availableSlots: "Available Time Slots",
      notes: "Notes"
    },
    doctors: {
      title: "Doctors",
      specialization: "Specialization",
      available: "Available",
      unavailable: "Unavailable",
      noDoctors: "No doctors found."
    },
    treatments: {
      title: "Treatments",
      description: "Description",
      duration: "Duration",
      minutes: "min",
      noTreatments: "No treatments found."
    },
    billing: {
      title: "Billing",
      invoiceNumber: "Invoice #",
      patient: "Patient",
      amount: "Amount",
      status: "Status",
      pending: "Pending",
      paid: "Paid",
      cancelled: "Cancelled",
      refunded: "Refunded",
      pay: "Pay",
      markAsPaid: "Mark as Paid",
      payConfirm: "Mark this invoice as paid?",
      noInvoices: "No invoices found.",
      items: "Items",
      quantity: "Qty",
      unitPrice: "Price",
      totalAmount: "Total:"
    },
    treatmentRecords: {
      title: "Treatment Records",
      newRecord: "New Treatment Record",
      selectPatient: "Select Patient",
      patientInfo: "Patient & Visit Information",
      chiefComplaint: "Chief Complaint & Symptoms",
      chiefComplaintText: "Chief Complaint",
      symptomDuration: "Symptom Duration",
      clinicalExam: "Clinical Examination",
      extraoralFindings: "Extraoral Findings",
      intraoralFindings: "Intraoral Findings",
      teethCondition: "Teeth Condition",
      gumCondition: "Gum Condition",
      radiographicFindings: "Radiographic Findings (X-rays)",
      diagnosis: "Diagnosis",
      primaryDiagnosis: "Primary Diagnosis",
      secondaryDiagnoses: "Secondary Diagnoses",
      treatmentPlan: "Treatment Plan",
      proposedPlan: "Proposed Treatment Plan",
      estimatedCost: "Estimated Cost ($)",
      treatmentStages: "Treatment Stages",
      procedure: "Procedure Performed",
      procedurePerformed: "Procedure Performed",
      duration: "Duration (minutes)",
      anaesthesiaUsed: "Anaesthesia Used",
      materialsUsed: "Materials Used",
      complications: "Complications",
      prescriptions: "Prescriptions & Instructions",
      prescriptionsText: "Prescriptions",
      postTreatmentInstructions: "Post-Treatment Instructions",
      followup: "Follow-up",
      nextAppointment: "Next Appointment",
      recallPeriod: "Recall Period (days)",
      additionalNotes: "Additional Notes",
      treatmentHistory: "Treatment History",
      recordsCount: "records",
      noRecords: "No treatment records found for this patient.",
      visitDate: "Visit Date",
      painLevel: "Pain Level",
      deleteConfirm: "Are you sure you want to delete this record?",
      saveRecord: "Save Record"
    },
    appointmentStatus: {
      "0": "Pending",
      "1": "Confirmed",
      "2": "In Progress",
      "3": "Completed",
      "4": "Cancelled",
      "5": "No Show"
    },
    invoiceStatus: {
      "0": "Pending",
      "1": "Paid",
      "2": "Cancelled",
      "3": "Refunded"
    }
  };

  private arTranslations: { [key: string]: any } = {
    common: {
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      view: "عرض",
      close: "إغلاق",
      search: "بحث",
      filter: "تصفية",
      actions: "الإجراءات",
      loading: "جاري التحميل...",
      noData: "لا توجد بيانات",
      confirm: "تأكيد",
      yes: "نعم",
      no: "لا",
      all: "الكل",
      status: "الحالة",
      date: "التاريخ",
      time: "الوقت",
      name: "الاسم",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      address: "العنوان",
      price: "السعر",
      total: "المجموع",
      back: "رجوع",
      next: "التالي",
      previous: "السابق",
      required: "مطلوب"
    },
    nav: {
      dashboard: "لوحة التحكم",
      patients: "المرضى",
      appointments: "المواعيد",
      doctors: "الأطباء",
      treatments: "العلاجات",
      billing: "الفواتير",
      treatmentRecords: "سجلات العلاج",
      clinicName: "عيادة طب الأسنان",
      clinicManagement: "نظام إدارة عيادة طب الأسنان"
    },
    dashboard: {
      title: "لوحة التحكم",
      todaysAppointments: "مواعيد اليوم",
      totalPatients: "إجمالي المرضى",
      monthlyRevenue: "الإيرادات الشهرية",
      pendingInvoices: "الفواتير المعلقة",
      todaysSchedule: "جدول اليوم",
      viewAll: "عرض الكل",
      quickActions: "إجراءات سريعة",
      newPatient: "مريض جديد",
      newAppointment: "موعد جديد",
      viewInvoices: "عرض الفواتير",
      noAppointmentsToday: "لا توجد مواعيد مجدولة لهذا اليوم."
    },
    patients: {
      title: "المرضى",
      addPatient: "إضافة مريض",
      editPatient: "تعديل المريض",
      newPatient: "مريض جديد",
      searchPlaceholder: "البحث عن مرضى...",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      dateOfBirth: "تاريخ الميلاد",
      gender: "الجنس",
      male: "ذكر",
      female: "أنثى",
      medicalHistory: "التاريخ الطبي",
      deleteConfirm: "هل أنت متأكد من حذف هذا المريض؟",
      noPatients: "لا يوجد مرضى."
    },
    appointments: {
      title: "المواعيد",
      newAppointment: "موعد جديد",
      patient: "المريض",
      doctor: "الطبيب",
      treatment: "العلاج",
      selectPatient: "اختر المريض",
      selectDoctor: "اختر الطبيب",
      selectTreatment: "اختر العلاج",
      allDoctors: "كل الأطباء",
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      inProgress: "قيد التنفيذ",
      completed: "مكتمل",
      cancelled: "ملغى",
      noShow: "لم يحضر",
      cancelAppointment: "إلغاء الموعد",
      cancelConfirm: "هل أنت متأكد من إلغاء هذا الموعد؟",
      noAppointments: "لا توجد مواعيد.",
      availableSlots: "الأوقات المتاحة",
      notes: "ملاحظات"
    },
    doctors: {
      title: "الأطباء",
      specialization: "التخصص",
      available: "متاح",
      unavailable: "غير متاح",
      noDoctors: "لا يوجد أطباء."
    },
    treatments: {
      title: "العلاجات",
      description: "الوصف",
      duration: "المدة",
      minutes: "دقيقة",
      noTreatments: "لا توجد علاجات."
    },
    billing: {
      title: "الفواتير",
      invoiceNumber: "رقم الفاتورة",
      patient: "المريض",
      amount: "المبلغ",
      status: "الحالة",
      pending: "معلق",
      paid: "مدفوع",
      cancelled: "ملغى",
      refunded: "مسترد",
      pay: "دفع",
      markAsPaid: "تحديد كمدفوعة",
      payConfirm: "تحديد هذه الفاتورة كمدفوعة؟",
      noInvoices: "لا توجد فواتير.",
      items: "البنود",
      quantity: "الكمية",
      unitPrice: "السعر",
      totalAmount: "المجموع:"
    },
    treatmentRecords: {
      title: "سجلات العلاج",
      newRecord: "سجل علاج جديد",
      selectPatient: "اختر المريض",
      patientInfo: "معلومات المريض والزائر",
      chiefComplaint: "الشكوى الرئيسية والأعراض",
      chiefComplaintText: "الشكوى الرئيسية",
      symptomDuration: "مدة الأعراض",
      clinicalExam: "الفحص السريري",
      extraoralFindings: "الت findings الخارجية",
      intraoralFindings: "الت findings الداخلية",
      teethCondition: "حالة الأسنان",
      gumCondition: "حالة اللثة",
      radiographicFindings: "الت findings الإشعاعية (أشعة)",
      diagnosis: "التشخيص",
      primaryDiagnosis: "التشخيص الأساسي",
      secondaryDiagnoses: "التشخيصات الثانوية",
      treatmentPlan: "خطة العلاج",
      proposedPlan: "خطة العلاج المقترحة",
      estimatedCost: "التكلفة المقدرة ($)",
      treatmentStages: "مراحل العلاج",
      procedure: "الإجراء المنفذ",
      procedurePerformed: "الإجراء المنفذ",
      duration: "المدة (دقائق)",
      anaesthesiaUsed: "التخدير المستخدم",
      materialsUsed: "المواد المستخدمة",
      complications: "المضاعفات",
      prescriptions: "الوصفات والتعليمات",
      prescriptionsText: "الوصفات الطبية",
      postTreatmentInstructions: "تعليمات ما بعد العلاج",
      followup: "المتابعة",
      nextAppointment: "الموعد التالي",
      recallPeriod: "فترة الاستدعاء (أيام)",
      additionalNotes: "ملاحظات إضافية",
      treatmentHistory: "سجل العلاج",
      recordsCount: "سجلات",
      noRecords: "لا توجد سجلات علاجية لهذا المريض.",
      visitDate: "تاريخ الزيارة",
      painLevel: "مستوى الألم",
      deleteConfirm: "هل أنت متأكد من حذف هذا السجل؟",
      saveRecord: "حفظ السجل"
    },
    appointmentStatus: {
      "0": "قيد الانتظار",
      "1": "مؤكد",
      "2": "قيد التنفيذ",
      "3": "مكتمل",
      "4": "ملغى",
      "5": "لم يحضر"
    },
    invoiceStatus: {
      "0": "معلق",
      "1": "مدفوع",
      "2": "ملغى",
      "3": "مسترد"
    }
  };

  constructor() {
    const savedLang = localStorage.getItem('language') || 'en';
    this.setLanguage(savedLang);
  }

  get currentLanguage() {
    return this.currentLang.value;
  }

  get isRTL(): boolean {
    return this.currentLang.value === 'ar';
  }

  setLanguage(lang: string): void {
    this.currentLang.next(lang);
    this.loadTranslations(lang);
    this.updateDirection(lang);
    localStorage.setItem('language', lang);
  }

  private updateDirection(lang: string): void {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  private loadTranslations(lang: string): void {
    const translations = lang === 'ar' ? this.arTranslations : this.enTranslations;
    this.translations = this.flattenObject(translations);
  }

  private flattenObject(obj: { [key: string]: any }, prefix = ''): { [key: string]: string } {
    return Object.keys(obj).reduce((acc: { [key: string]: string }, key) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(acc, this.flattenObject(obj[key], pre + key));
      } else {
        acc[pre + key] = obj[key];
      }
      return acc;
    }, {});
  }

  translate(key: string): string {
    return this.translations[key] || key;
  }

  instant(key: string): string {
    return this.translate(key);
  }
}
