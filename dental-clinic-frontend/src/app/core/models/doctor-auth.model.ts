import { AppointmentStatus, Appointment } from './appointment.model';

export interface DoctorLoginDto {
  email: string;
  password: string;
}

export interface DoctorAuthResponseDto {
  token: string;
  refreshToken: string;
  expiresAt: string;
  doctorId: number;
  fullName: string;
  email: string;
  specialization: string;
}

export interface DoctorProfileDto {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  phone: string;
  email?: string;
  bio?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface UpdateDoctorProfileDto {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  bio?: string;
}

export interface DoctorChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface DoctorDashboardDto {
  todayAppointmentCount: number;
  upcomingAppointmentCount: number;
  patientsSeenToday: number;
  completedToday: number;
  todaySchedule: Appointment[];
}

export interface CompleteAppointmentDto {
  notes?: string;
}

export interface DoctorPerformanceDto {
  doctorId: number;
  doctorName: string;
  specialization: string;
  appointmentsCompleted: number;
  appointmentsCancelled: number;
  noShows: number;
  revenue: number;
  completionRate: number;
}

export interface DoctorWorkingHoursDto {
  id: number;
  doctorId: number;
  dayOfWeek: number;
  dayName: string;
  startTime: string; // "HH:mm:ss"
  endTime: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
  isWorkingDay: boolean;
}

export interface UpsertWorkingHoursDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
  isWorkingDay: boolean;
}

export interface DoctorLeaveDto {
  id: number;
  doctorId: number;
  startDate: string;
  endDate: string;
  reason?: string;
  createdAt: string;
}

export interface CreateDoctorLeaveDto {
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface DoctorCreateTreatmentRecordDto {
  patientId: number;
  appointmentId?: number;
  visitDate: string;
  chiefComplaint: string;
  painLevel: number;
  symptomDuration: string;
  extraoralFindings: string;
  intraoralFindings: string;
  teethCondition: string;
  gumCondition: string;
  radiographicFindings: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string;
  treatmentPlan: string;
  treatmentStages: string;
  estimatedCost: number;
  procedurePerformed: string;
  anaesthesiaUsed: string;
  materialsUsed: string;
  complications: string;
  procedureDurationMinutes: number;
  prescriptions: string;
  postTreatmentInstructions: string;
  nextAppointmentDate?: string;
  recallPeriodDays: number;
  notes: string;
}

export { AppointmentStatus };
