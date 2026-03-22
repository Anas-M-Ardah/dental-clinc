export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: Gender;
  address?: string;
  medicalHistory?: string;
  createdAt: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: Gender;
  address?: string;
  medicalHistory?: string;
}

export interface UpdatePatientDto extends CreatePatientDto {}

export enum Gender {
  Male = 0,
  Female = 1
}
