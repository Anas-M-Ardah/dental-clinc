export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  phone: string;
  email?: string;
  bio?: string;
  isAvailable: boolean;
}
