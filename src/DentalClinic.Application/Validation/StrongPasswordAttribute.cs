using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace DentalClinic.Application.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public class StrongPasswordAttribute : ValidationAttribute
{
    public int MinLength { get; set; } = 8;

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not string password)
            return new ValidationResult("Password is required.");

        var errors = new List<string>();

        if (password.Length < MinLength)
            errors.Add($"at least {MinLength} characters");
        if (!Regex.IsMatch(password, @"[A-Z]"))
            errors.Add("an uppercase letter");
        if (!Regex.IsMatch(password, @"[a-z]"))
            errors.Add("a lowercase letter");
        if (!Regex.IsMatch(password, @"\d"))
            errors.Add("a digit");
        if (!Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?`~]"))
            errors.Add("a special character");

        if (errors.Count > 0)
            return new ValidationResult($"Password must contain {string.Join(", ", errors)}.");

        return ValidationResult.Success;
    }
}
