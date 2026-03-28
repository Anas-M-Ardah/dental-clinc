export interface TreatmentRecord {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
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
  
  createdAt: string;
}

export interface CreateTreatmentRecordDto {
  patientId: number;
  doctorId: number;
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

export interface UpdateTreatmentRecordDto {
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
