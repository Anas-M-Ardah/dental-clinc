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
            entity.HasOne(e => e.Patient)
                .WithMany(p => p.Invoices)
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Appointment)
                .WithOne(a => a.Invoice)
                .HasForeignKey<Invoice>(e => e.AppointmentId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(e => e.PatientId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.InvoiceNumber).IsUnique();
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
    }
}
