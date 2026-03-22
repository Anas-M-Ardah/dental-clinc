export enum AppointmentStatus {
  Pending = 0,
  Confirmed = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4,
  NoShow = 5
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  treatmentId: number;
  treatmentName: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface CreateAppointmentDto {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  startTime: string;
  treatmentId: number;
  notes?: string;
}

export interface UpdateAppointmentDto {
  appointmentDate: string;
  startTime: string;
  doctorId: number;
  notes?: string;
  status: AppointmentStatus;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
}
