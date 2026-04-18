using DentalClinic.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Data;

public class DentalClinicDbContext : DbContext
{
    public DentalClinicDbContext(DbContextOptions<DentalClinicDbContext> options) : base(options)
    {
    }

    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<Treatment> Treatments => Set<Treatment>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<TreatmentRecord> TreatmentRecords => Set<TreatmentRecord>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<DoctorWorkingHours> DoctorWorkingHours => Set<DoctorWorkingHours>();
    public DbSet<DoctorLeave> DoctorLeaves => Set<DoctorLeave>();
    public DbSet<WaitingListEntry> WaitingListEntries => Set<WaitingListEntry>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<PatientAllergy> PatientAllergies => Set<PatientAllergy>();
    public DbSet<PatientMedication> PatientMedications => Set<PatientMedication>();
    public DbSet<PatientCondition> PatientConditions => Set<PatientCondition>();
    public DbSet<FamilyMedicalHistory> FamilyMedicalHistories => Set<FamilyMedicalHistory>();
    public DbSet<PatientSurvey> PatientSurveys => Set<PatientSurvey>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        SeedData.Seed(modelBuilder);

        modelBuilder.Entity<Patient>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.HasIndex(e => e.Phone);
            entity.HasIndex(e => e.LastName);
            entity.HasIndex(e => e.Email)
                  .IsUnique()
                  .HasFilter("[Email] IS NOT NULL");
        });

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Specialization).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100);
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Patient)
                .WithMany(p => p.Appointments)
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Doctor)
                .WithMany(d => d.Appointments)
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Treatment)
                .WithMany(t => t.Appointments)
                .HasForeignKey(e => e.TreatmentId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(e => e.AppointmentDate);
            entity.HasIndex(e => e.DoctorId);
            entity.HasIndex(e => e.PatientId);
        });

        modelBuilder.Entity<Treatment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Price).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.InvoiceNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            entity.Property(e => e.DiscountAmount).HasPrecision(18, 2);
            entity.Property(e => e.PaidAmount).HasPrecision(18, 2);
            entity.Ignore(e => e.BalanceDue);
            entity.HasOne(e => e.Patient)
                .WithMany(p => p.Invoices)
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Appointment)
                .WithOne(a => a.Invoice)
                .HasForeignKey<Invoice>(e => e.AppointmentId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Coupon)
                .WithMany()
                .HasForeignKey(e => e.CouponId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(e => e.PatientId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.InvoiceNumber).IsUnique();
            entity.HasIndex(e => e.DueDate);
        });

        modelBuilder.Entity<InvoiceItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
            entity.HasOne(e => e.Invoice)
                .WithMany(i => i.Items)
                .HasForeignKey(e => e.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Treatment)
                .WithMany(t => t.InvoiceItems)
                .HasForeignKey(e => e.TreatmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TreatmentRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ChiefComplaint).HasMaxLength(1000);
            entity.Property(e => e.SymptomDuration).HasMaxLength(100);
            entity.Property(e => e.ExtraoralFindings).HasMaxLength(2000);
            entity.Property(e => e.IntraoralFindings).HasMaxLength(2000);
            entity.Property(e => e.TeethCondition).HasMaxLength(2000);
            entity.Property(e => e.GumCondition).HasMaxLength(1000);
            entity.Property(e => e.RadiographicFindings).HasMaxLength(2000);
            entity.Property(e => e.PrimaryDiagnosis).HasMaxLength(500);
            entity.Property(e => e.SecondaryDiagnoses).HasMaxLength(1000);
            entity.Property(e => e.TreatmentPlan).HasMaxLength(2000);
            entity.Property(e => e.TreatmentStages).HasMaxLength(1000);
            entity.Property(e => e.EstimatedCost).HasPrecision(18, 2);
            entity.Property(e => e.ProcedurePerformed).HasMaxLength(2000);
            entity.Property(e => e.AnaesthesiaUsed).HasMaxLength(500);
            entity.Property(e => e.MaterialsUsed).HasMaxLength(1000);
            entity.Property(e => e.Complications).HasMaxLength(1000);
            entity.Property(e => e.Prescriptions).HasMaxLength(2000);
            entity.Property(e => e.PostTreatmentInstructions).HasMaxLength(2000);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            
            entity.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Appointment)
                .WithMany()
                .HasForeignKey(e => e.AppointmentId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<DoctorWorkingHours>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Doctor)
                .WithMany(d => d.WorkingHours)
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.DoctorId, e.DayOfWeek }).IsUnique();
        });

        modelBuilder.Entity<DoctorLeave>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.HasOne(e => e.Doctor)
                .WithMany(d => d.Leaves)
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.DoctorId, e.StartDate, e.EndDate });
        });

        modelBuilder.Entity<WaitingListEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Treatment)
                .WithMany()
                .HasForeignKey(e => e.TreatmentId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.DoctorId, e.PreferredDate });
        });

        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.PatientId, e.IsRead });
        });

        modelBuilder.Entity<PaymentTransaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.PaymentMethod).IsRequired().HasMaxLength(50);
            entity.Property(e => e.TransactionId).HasMaxLength(100);
            entity.Property(e => e.GatewayResponse).HasMaxLength(2000);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.HasOne(e => e.Invoice)
                .WithMany(i => i.Payments)
                .HasForeignKey(e => e.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.InvoiceId);
            entity.HasIndex(e => e.TransactionId);
        });

        modelBuilder.Entity<Coupon>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(200);
            entity.Property(e => e.DiscountValue).HasPrecision(18, 2);
            entity.Property(e => e.MaxDiscountAmount).HasPrecision(18, 2);
            entity.Property(e => e.MinInvoiceAmount).HasPrecision(18, 2);
            entity.HasIndex(e => e.Code).IsUnique();
        });

        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.StoredFileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.ContentType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.UploadedBy).HasMaxLength(100);
            entity.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.TreatmentRecord)
                .WithMany()
                .HasForeignKey(e => e.TreatmentRecordId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(e => e.PatientId);
            entity.HasIndex(e => e.TreatmentRecordId);
        });

        modelBuilder.Entity<PatientAllergy>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AllergyName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Severity).HasMaxLength(20);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.HasOne(e => e.Patient)
                .WithMany(p => p.Allergies)
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.PatientId);
        });

        modelBuilder.Entity<PatientMedication>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MedicationName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Dosage).HasMaxLength(100);
            entity.Property(e => e.Frequency).HasMaxLength(100);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.HasOne(e => e.Patient)
                .WithMany(p => p.Medications)
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.PatientId);
        });

        modelBuilder.Entity<PatientCondition>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ConditionName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.HasOne(e => e.Patient)
                .WithMany(p => p.Conditions)
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.PatientId);
        });

        modelBuilder.Entity<FamilyMedicalHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Relationship).IsRequired().HasMaxLength(50);
            entity.Property(e => e.ConditionName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.HasOne(e => e.Patient)
                .WithMany(p => p.FamilyHistory)
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => e.PatientId);
        });

        modelBuilder.Entity<PatientSurvey>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Comments).HasMaxLength(1000);
            entity.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Appointment)
                .WithMany()
                .HasForeignKey(e => e.AppointmentId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(e => e.PatientId);
            entity.HasIndex(e => e.AppointmentId).IsUnique();
        });
    }
}
