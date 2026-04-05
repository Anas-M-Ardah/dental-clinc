using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DentalClinic.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAdvancedScheduling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaxFutureBookingDays",
                table: "Doctors",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MinAdvanceBookingHours",
                table: "Doctors",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "DoctorLeaves",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DoctorId = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorLeaves", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorLeaves_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DoctorWorkingHours",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DoctorId = table.Column<int>(type: "int", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    SlotDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    BufferMinutes = table.Column<int>(type: "int", nullable: false),
                    IsWorkingDay = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorWorkingHours", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorWorkingHours_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WaitingListEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientId = table.Column<int>(type: "int", nullable: false),
                    DoctorId = table.Column<int>(type: "int", nullable: false),
                    TreatmentId = table.Column<int>(type: "int", nullable: false),
                    PreferredDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PreferredTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    IsNotified = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WaitingListEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WaitingListEntries_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WaitingListEntries_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WaitingListEntries_Treatments_TreatmentId",
                        column: x => x.TreatmentId,
                        principalTable: "Treatments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Doctors",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "MaxFutureBookingDays", "MinAdvanceBookingHours" },
                values: new object[] { 90, 24 });

            migrationBuilder.UpdateData(
                table: "Doctors",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "MaxFutureBookingDays", "MinAdvanceBookingHours" },
                values: new object[] { 90, 24 });

            migrationBuilder.UpdateData(
                table: "Doctors",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "MaxFutureBookingDays", "MinAdvanceBookingHours" },
                values: new object[] { 90, 24 });

            migrationBuilder.UpdateData(
                table: "Doctors",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "MaxFutureBookingDays", "MinAdvanceBookingHours" },
                values: new object[] { 90, 24 });

            migrationBuilder.CreateIndex(
                name: "IX_DoctorLeaves_DoctorId_StartDate_EndDate",
                table: "DoctorLeaves",
                columns: new[] { "DoctorId", "StartDate", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_DoctorWorkingHours_DoctorId_DayOfWeek",
                table: "DoctorWorkingHours",
                columns: new[] { "DoctorId", "DayOfWeek" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WaitingListEntries_DoctorId_PreferredDate",
                table: "WaitingListEntries",
                columns: new[] { "DoctorId", "PreferredDate" });

            migrationBuilder.CreateIndex(
                name: "IX_WaitingListEntries_PatientId",
                table: "WaitingListEntries",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_WaitingListEntries_TreatmentId",
                table: "WaitingListEntries",
                column: "TreatmentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DoctorLeaves");

            migrationBuilder.DropTable(
                name: "DoctorWorkingHours");

            migrationBuilder.DropTable(
                name: "WaitingListEntries");

            migrationBuilder.DropColumn(
                name: "MaxFutureBookingDays",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "MinAdvanceBookingHours",
                table: "Doctors");
        }
    }
}
