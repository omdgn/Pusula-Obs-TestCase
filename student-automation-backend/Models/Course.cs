using System.ComponentModel.DataAnnotations;

namespace StudentAutomation.Models
{
    public class Course
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public Guid TeacherId { get; set; }
        public User Teacher { get; set; } = null!;

        public string Status { get; set; } = "NotStarted"; // "InProgress", "Completed"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<CourseStudent> CourseStudents { get; set; } = new List<CourseStudent>();
    }
}
