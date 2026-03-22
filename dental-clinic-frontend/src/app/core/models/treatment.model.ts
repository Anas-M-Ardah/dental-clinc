export interface Treatment {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface CreateTreatmentDto {
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
}
