using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DentalClinic.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorAuthFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FailedLoginAttempts",
                table: "Doctors",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Doctors",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastLoginAt",
                table: "Doctors",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LockoutEnd",
                table: "Doctors",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "Doctors",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "Doctors",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpiry",
                table: "Doctors",
                type: "datetime2",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Doctors",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "FailedLoginAttempts", "IsActive", "LastLoginAt", "LockoutEnd", "PasswordHash", "RefreshToken", "RefreshTokenExpiry" },
                values: new object[] { 0, true, null, null, null, null, null });

            migrationBuilder.UpdateData(
                table: "Doctors",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "FailedLoginAttempts", "IsActive", "LastLoginAt", "LockoutEnd", "PasswordHash", "RefreshToken", "RefreshTokenExpiry" },
                values: new object[] { 0, true, null, null, null, null, null });

            migrationBuilder.UpdateData(
                table: "Doctors",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "FailedLoginAttempts", "IsActive", "LastLoginAt", "LockoutEnd", "PasswordHash", "RefreshToken", "RefreshTokenExpiry" },
                values: new object[] { 0, true, null, null, null, null, null });

            migrationBuilder.UpdateData(
                table: "Doctors",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "FailedLoginAttempts", "IsActive", "LastLoginAt", "LockoutEnd", "PasswordHash", "RefreshToken", "RefreshTokenExpiry" },
                values: new object[] { 0, true, null, null, null, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_Email",
                table: "Doctors",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Doctors_Email",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "FailedLoginAttempts",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "LastLoginAt",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "LockoutEnd",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "RefreshToken",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "RefreshTokenExpiry",
                table: "Doctors");
        }
    }
}
