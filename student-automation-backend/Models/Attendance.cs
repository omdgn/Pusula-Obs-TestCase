using System.ComponentModel.DataAnnotations;

namespace StudentAutomation.Models
{
    public enum AttendanceStatus
    {
        Present,    // Mevcut
        Absent,     // Devamsız
        Late,       // Geç kaldı
        Excused     // Mazeret
    }

    public class Attendance
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid StudentId { get; set; }
        public User Student { get; set; } = null!;

        [Required]
        public Guid CourseId { get; set; }
        public Course Course { get; set; } = null!;

        [Required]
        public Guid TeacherId { get; set; }
        public User Teacher { get; set; } = null!;

        [Required]
        public AttendanceStatus Status { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}