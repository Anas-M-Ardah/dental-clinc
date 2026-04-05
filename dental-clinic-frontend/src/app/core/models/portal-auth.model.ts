import { Gender } from './patient.model';

export interface PatientLoginDto {
  email: string;
  password: string;
}

export interface PatientRegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  expiresAt: string;
  patientId: number;
  fullName: string;
  email: string;
}

export interface UpdatePortalProfileDto {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
}

export interface BookAppointmentDto {
  doctorId: number;
  appointmentDate: string;
  startTime: string;
  treatmentId: number;
  notes?: string;
}
