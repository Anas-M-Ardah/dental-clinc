using System.Security.Claims;
using DentalClinic.Domain.Entities;
using DentalClinic.Infrastructure.Data;

namespace DentalClinic.Api.Middleware;

public class AuditMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly HashSet<string> AuditedMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        "POST", "PUT", "PATCH", "DELETE"
    };

    private static readonly HashSet<string> SensitivePaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/patient-auth/login",
        "/api/patient-auth/register",
        "/api/admin-auth/login",
        "/api/portal/change-password"
    };

    public AuditMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, DentalClinicDbContext dbContext)
    {
        await _next(context);

        var method = context.Request.Method;
        var path = context.Request.Path.Value ?? "";

        var shouldAudit = AuditedMethods.Contains(method) || SensitivePaths.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase));

        if (!shouldAudit || context.Response.StatusCode >= 400)
            return;

        var (entityType, action) = ParsePathInfo(method, path);
        if (string.IsNullOrEmpty(entityType)) return;

        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = context.User.FindFirstValue(ClaimTypes.Role);

        var log = new AuditLog
        {
            Action = action,
            EntityType = entityType,
            EntityId = ExtractEntityId(path),
            UserId = userId,
            UserRole = role,
            Details = $"{method} {path}",
            IpAddress = context.Connection.RemoteIpAddress?.ToString(),
            Timestamp = DateTime.UtcNow
        };

        dbContext.AuditLogs.Add(log);
        await dbContext.SaveChangesAsync();
    }

    private static (string EntityType, string Action) ParsePathInfo(string method, string path)
    {
        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length < 2) return ("", "");

        // Determine entity type from path
        var entityType = segments.Length >= 2 ? segments[1] : "";
        entityType = entityType switch
        {
            "patients" => "Patient",
            "doctors" => "Doctor",
            "appointments" => "Appointment",
            "treatments" => "Treatment",
            "invoices" => "Invoice",
            "treatment-records" => "TreatmentRecord",
            "documents" => "Document",
            "coupons" => "Coupon",
            "patient-auth" => "PatientAuth",
            "admin-auth" => "AdminAuth",
            "portal" => ParsePortalEntity(segments),
            _ => entityType
        };

        var action = method switch
        {
            "POST" => path.Contains("login", StringComparison.OrdinalIgnoreCase) ? "Login" :
                       path.Contains("register", StringComparison.OrdinalIgnoreCase) ? "Register" :
                       path.Contains("change-password", StringComparison.OrdinalIgnoreCase) ? "PasswordChange" :
                       path.Contains("pay", StringComparison.OrdinalIgnoreCase) ? "Payment" :
                       "Create",
            "PUT" => "Update",
            "PATCH" => path.Contains("cancel", StringComparison.OrdinalIgnoreCase) ? "Cancel" :
                       path.Contains("archive", StringComparison.OrdinalIgnoreCase) ? "Archive" :
                       path.Contains("reschedule", StringComparison.OrdinalIgnoreCase) ? "Reschedule" :
                       "Update",
            "DELETE" => "Delete",
            _ => method
        };

        return (entityType, action);
    }

    private static string ParsePortalEntity(string[] segments)
    {
        if (segments.Length < 3) return "Portal";
        return segments[2] switch
        {
            "appointments" => "Appointment",
            "invoices" => "Invoice",
            "profile" => "PatientProfile",
            "documents" => "Document",
            "surveys" => "Survey",
            "change-password" => "PatientAuth",
            "waiting-list" => "WaitingList",
            _ => "Portal"
        };
    }

    private static string? ExtractEntityId(string path)
    {
        var segments = path.Split('/');
        for (int i = segments.Length - 1; i >= 0; i--)
        {
            if (int.TryParse(segments[i], out _))
                return segments[i];
        }
        return null;
    }
}
