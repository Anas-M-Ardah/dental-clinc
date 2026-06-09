using System.Text;
using System.Threading.RateLimiting;
using DentalClinic.Api.Middleware;
using DentalClinic.Application.Interfaces;
using DentalClinic.Application.Services;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Infrastructure.Data;
using DentalClinic.Infrastructure.Repositories;
using DentalClinic.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .WriteTo.File("logs/dental-clinic-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<DentalClinicDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHealthChecks()
    .AddDbContextCheck<DentalClinicDbContext>("database");

builder.Services.AddScoped<IPatientRepository, PatientRepository>();
builder.Services.AddScoped<IDoctorRepository, DoctorRepository>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<ITreatmentRepository, TreatmentRepository>();
builder.Services.AddScoped<IInvoiceRepository, InvoiceRepository>();
builder.Services.AddScoped<ITreatmentRecordRepository, TreatmentRecordRepository>();

builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<ITreatmentService, TreatmentService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ITreatmentRecordService, TreatmentRecordService>();
builder.Services.AddScoped<IPatientAuthService, PatientAuthService>();
builder.Services.AddScoped<IAdminUserRepository, AdminUserRepository>();
builder.Services.AddScoped<IAdminAuthService, AdminAuthService>();
builder.Services.AddScoped<IDoctorAuthRepository, DoctorAuthRepository>();
builder.Services.AddScoped<IDoctorAuthService, DoctorAuthService>();
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IDoctorScheduleRepository, DoctorScheduleRepository>();
builder.Services.AddScoped<IDoctorScheduleService, DoctorScheduleService>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ICouponRepository, CouponRepository>();
builder.Services.AddScoped<ICouponService, CouponService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
builder.Services.AddScoped<IDocumentService>(provider =>
{
    var repo = provider.GetRequiredService<IDocumentRepository>();
    var env = provider.GetRequiredService<IWebHostEnvironment>();
    var storagePath = Path.Combine(env.ContentRootPath, "uploads", "documents");
    return new DocumentService(repo, storagePath);
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("PatientOnly", policy =>
        policy.RequireAuthenticatedUser()
              .RequireRole("patient"));
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireAuthenticatedUser()
              .RequireRole("admin"));
    options.AddPolicy("DoctorOnly", policy =>
        policy.RequireAuthenticatedUser()
              .RequireRole("doctor"));
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("AuthRateLimit", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(5);
        opt.QueueLimit = 0;
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<DentalClinicDbContext>();
    context.Database.Migrate();

    // Seed default admin if none exists
    if (!context.AdminUsers.Any())
    {
        context.AdminUsers.Add(new AdminUser
        {
            FullName = "System Admin",
            Email = "admin@clinic.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = AdminRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
        context.SaveChanges();
    }

    // Seed test doctor account (Phase 10 - Doctor Portal): Dr. Anas Alardah
    const string testDoctorEmail = "anas@clinic.com";
    var existingTestDoctor = context.Doctors.FirstOrDefault(d => d.Email == testDoctorEmail);
    if (existingTestDoctor == null)
    {
        context.Doctors.Add(new Doctor
        {
            FirstName = "Anas",
            LastName = "Alardah",
            Specialization = "General Dentistry",
            Phone = "+962790000005",
            Email = testDoctorEmail,
            Bio = "Lead dentist and clinic founder.",
            IsAvailable = true,
            IsActive = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor@123"),
            CreatedAt = DateTime.UtcNow
        });
        context.SaveChanges();
    }
    else if (string.IsNullOrEmpty(existingTestDoctor.PasswordHash))
    {
        existingTestDoctor.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor@123");
        existingTestDoctor.IsActive = true;
        context.SaveChanges();
    }

    // Seed default working hours for doctors that don't have any
    var doctorsWithoutHours = context.Doctors
        .Where(d => !context.DoctorWorkingHours.Any(wh => wh.DoctorId == d.Id))
        .Select(d => d.Id)
        .ToList();

    if (doctorsWithoutHours.Any())
    {
        var workDays = new[] { DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday,
                               DayOfWeek.Wednesday, DayOfWeek.Thursday };
        foreach (var doctorId in doctorsWithoutHours)
        {
            foreach (var day in workDays)
            {
                context.DoctorWorkingHours.Add(new DoctorWorkingHours
                {
                    DoctorId = doctorId,
                    DayOfWeek = day,
                    StartTime = new TimeSpan(8, 0, 0),
                    EndTime = new TimeSpan(17, 0, 0),
                    SlotDurationMinutes = 30,
                    BufferMinutes = 0,
                    IsWorkingDay = true
                });
            }
        }
        context.SaveChanges();
    }
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("ClientIP", httpContext.Connection.RemoteIpAddress?.ToString() ?? "-");
        diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent.ToString());
        if (httpContext.User.Identity?.IsAuthenticated == true)
            diagnosticContext.Set("UserId", httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "-");
    };
});

app.UseCors("AllowFrontend");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<AuditMiddleware>();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
