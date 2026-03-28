using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Application.DTOs;

namespace DentalClinic.Tests.Helpers;

public static class TestDataFactory
{
    public static Patient CreatePatient(int id = 1, string firstName = "John", string lastName = "Doe")
    {
        return new Patient
        {
            Id = id,
            FirstName = firstName,
            LastName = lastName,
            Phone = "1234567890",
            Email = "john.doe@test.com",
            DateOfBirth = new DateTime(1990, 1, 15),
            Gender = Gender.Male,
            Address = "123 Test St",
            MedicalHistory = "None",
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
    }

    public static CreatePatientDto CreatePatientDto()
    {
        return new CreatePatientDto
        {
            FirstName = "Jane",
            LastName = "Smith",
            Phone = "9876543210",
            Email = "jane.smith@test.com",
            DateOfBirth = new DateTime(1985, 5, 20),
            Gender = Gender.Female,
            Address = "456 Test Ave",
            MedicalHistory = "Allergic to penicillin"
        };
    }

    public static UpdatePatientDto UpdatePatientDto()
    {
        return new UpdatePatientDto
        {
            FirstName = "Jane",
            LastName = "Updated",
            Phone = "1112223333",
            Email = "jane.updated@test.com",
            DateOfBirth = new DateTime(1985, 5, 20),
            Gender = Gender.Female,
            Address = "789 Updated St"
        };
    }

    public static Doctor CreateDoctor(int id = 1, string firstName = "Sarah", string lastName = "Wilson")
    {
        return new Doctor
        {
            Id = id,
            FirstName = firstName,
            LastName = lastName,
            Specialization = "Orthodontics",
            Phone = "5551234567",
            Email = "dr.wilson@test.com",
            Bio = "Experienced orthodontist",
            IsAvailable = true,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
    }

    public static Treatment CreateTreatment(int id = 1, string name = "Teeth Cleaning", decimal price = 100m, int durationMinutes = 30)
    {
        return new Treatment
        {
            Id = id,
            Name = name,
            Description = "Standard cleaning",
            Price = price,
            DurationMinutes = durationMinutes,
            IsActive = true,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
    }

    public static CreateTreatmentDto CreateTreatmentDto()
    {
        return new CreateTreatmentDto
        {
            Name = "Root Canal",
            Description = "Root canal treatment",
            Price = 500m,
            DurationMinutes = 60
        };
    }

    public static Appointment CreateAppointment(int id = 1, int patientId = 1, int doctorId = 1, int treatmentId = 1)
    {
        var patient = CreatePatient(patientId);
        var doctor = CreateDoctor(doctorId);
        var treatment = CreateTreatment(treatmentId);

        return new Appointment
        {
            Id = id,
            PatientId = patientId,
            DoctorId = doctorId,
            TreatmentId = treatmentId,
            AppointmentDate = new DateTime(2024, 6, 15),
            StartTime = new TimeSpan(9, 0, 0),
            EndTime = new TimeSpan(9, 30, 0),
            Notes = "Regular checkup",
            Status = AppointmentStatus.Pending,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Patient = patient,
            Doctor = doctor,
            Treatment = treatment
        };
    }

    public static CreateAppointmentDto CreateAppointmentDto()
    {
        return new CreateAppointmentDto
        {
            PatientId = 1,
            DoctorId = 1,
            AppointmentDate = new DateTime(2024, 6, 15),
            StartTime = new TimeSpan(10, 0, 0),
            TreatmentId = 1,
            Notes = "New appointment"
        };
    }

    public static UpdateAppointmentDto UpdateAppointmentDto()
    {
        return new UpdateAppointmentDto
        {
            AppointmentDate = new DateTime(2024, 6, 16),
            StartTime = new TimeSpan(11, 0, 0),
            DoctorId = 1,
            Notes = "Rescheduled",
            Status = AppointmentStatus.Confirmed
        };
    }

    public static Invoice CreateInvoice(int id = 1, int patientId = 1)
    {
        var patient = CreatePatient(patientId);
        return new Invoice
        {
            Id = id,
            InvoiceNumber = "INV-20240101-ABCD1234",
            PatientId = patientId,
            AppointmentId = 1,
            TotalAmount = 100m,
            Status = InvoiceStatus.Pending,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Patient = patient,
            Items = new List<InvoiceItem>
            {
                new InvoiceItem
                {
                    Id = 1,
                    InvoiceId = id,
                    TreatmentId = 1,
                    Quantity = 1,
                    UnitPrice = 100m,
                    TotalPrice = 100m,
                    Treatment = CreateTreatment()
                }
            }
        };
    }

    public static CreateInvoiceDto CreateInvoiceDto()
    {
        return new CreateInvoiceDto
        {
            PatientId = 1,
            AppointmentId = 1,
            Items = new List<CreateInvoiceItemDto>
            {
                new CreateInvoiceItemDto { TreatmentId = 1, Quantity = 2 }
            }
        };
    }

    public static TreatmentRecord CreateTreatmentRecord(int id = 1, int patientId = 1, int doctorId = 1)
    {
        return new TreatmentRecord
        {
            Id = id,
            PatientId = patientId,
            DoctorId = doctorId,
            AppointmentId = 1,
            VisitDate = new DateTime(2024, 6, 15),
            ChiefComplaint = "Tooth pain",
            PainLevel = 5,
            SymptomDuration = "2 days",
            ExtraoralFindings = "Normal",
            IntraoralFindings = "Cavity in tooth 18",
            TeethCondition = "Moderate decay",
            GumCondition = "Healthy",
            RadiographicFindings = "Periapical radiolucency",
            PrimaryDiagnosis = "Dental caries",
            SecondaryDiagnoses = "None",
            TreatmentPlan = "Filling",
            TreatmentStages = "Single stage",
            EstimatedCost = 200m,
            ProcedurePerformed = "Composite filling",
            AnaesthesiaUsed = "Local",
            MaterialsUsed = "Composite resin",
            Complications = "None",
            ProcedureDurationMinutes = 45,
            Prescriptions = "Ibuprofen 400mg",
            PostTreatmentInstructions = "Avoid hard food",
            NextAppointmentDate = new DateTime(2024, 7, 15),
            RecallPeriodDays = 30,
            Notes = "Procedure went well",
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Patient = CreatePatient(patientId),
            Doctor = CreateDoctor(doctorId)
        };
    }

    public static CreateTreatmentRecordDto CreateTreatmentRecordDto()
    {
        return new CreateTreatmentRecordDto
        {
            PatientId = 1,
            DoctorId = 1,
            AppointmentId = 1,
            VisitDate = new DateTime(2024, 6, 15),
            ChiefComplaint = "Tooth pain",
            PainLevel = 5,
            SymptomDuration = "2 days",
            ExtraoralFindings = "Normal",
            IntraoralFindings = "Cavity",
            TeethCondition = "Decay",
            GumCondition = "Healthy",
            RadiographicFindings = "Normal",
            PrimaryDiagnosis = "Caries",
            SecondaryDiagnoses = "None",
            TreatmentPlan = "Filling",
            TreatmentStages = "One stage",
            EstimatedCost = 200m,
            ProcedurePerformed = "Filling",
            AnaesthesiaUsed = "Local",
            MaterialsUsed = "Composite",
            Complications = "None",
            ProcedureDurationMinutes = 45,
            Prescriptions = "Ibuprofen",
            PostTreatmentInstructions = "Avoid hard food",
            NextAppointmentDate = new DateTime(2024, 7, 15),
            RecallPeriodDays = 30,
            Notes = "Standard procedure"
        };
    }

    public static UpdateTreatmentRecordDto UpdateTreatmentRecordDto()
    {
        return new UpdateTreatmentRecordDto
        {
            VisitDate = new DateTime(2024, 6, 15),
            ChiefComplaint = "Updated complaint",
            PainLevel = 3,
            SymptomDuration = "1 day",
            ExtraoralFindings = "Normal",
            IntraoralFindings = "Updated findings",
            TeethCondition = "Improved",
            GumCondition = "Healthy",
            RadiographicFindings = "Clear",
            PrimaryDiagnosis = "Resolved",
            SecondaryDiagnoses = "None",
            TreatmentPlan = "Follow-up",
            TreatmentStages = "Complete",
            EstimatedCost = 0m,
            ProcedurePerformed = "Checkup",
            AnaesthesiaUsed = "None",
            MaterialsUsed = "None",
            Complications = "None",
            ProcedureDurationMinutes = 15,
            Prescriptions = "None",
            PostTreatmentInstructions = "Continue care",
            NextAppointmentDate = null,
            RecallPeriodDays = 180,
            Notes = "Patient recovering well"
        };
    }
}
