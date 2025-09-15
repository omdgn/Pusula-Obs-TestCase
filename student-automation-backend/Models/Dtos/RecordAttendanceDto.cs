using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace StudentAutomation.Models.Dtos
{
    [SwaggerSchema("Attendance record data")]
    public class RecordAttendanceDto
    {
        [Required(ErrorMessage = "Öğrenci ID gereklidir.")]
        [SwaggerSchema("ID of the student (example: 12345678-1234-1234-1234-123456789012)")]
        public Guid StudentId { get; set; }

        [Required(ErrorMessage = "Ders ID gereklidir.")]
        [SwaggerSchema("ID of the course (example: 87654321-4321-4321-4321-210987654321)")]
        public Guid CourseId { get; set; }

        [Required(ErrorMessage = "Devamsızlık durumu gereklidir.")]
        [SwaggerSchema("Attendance status: 0=Present, 1=Absent, 2=Late, 3=Excused (example: 1)")]
        public AttendanceStatus Status { get; set; }

        [Required(ErrorMessage = "Tarih gereklidir.")]
        [SwaggerSchema("Date of attendance (example: 2025-01-15T09:00:00Z)")]
        public DateTime Date { get; set; }

        [SwaggerSchema("Optional notes about attendance (example: Student was absent due to illness)")]
        public string Notes { get; set; } = string.Empty;
    }
}