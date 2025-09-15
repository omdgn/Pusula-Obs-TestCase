using System.ComponentModel.DataAnnotations;

namespace StudentAutomation.Models
{
    public class Grade
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Range(0, 100)]
        public decimal Score { get; set; }

        public string Description { get; set; } = string.Empty;

        [Required]
        public Guid StudentId { get; set; }
        public User Student { get; set; } = null!;

        [Required]
        public Guid CourseId { get; set; }
        public Course Course { get; set; } = null!;

        [Required]
        public Guid TeacherId { get; set; }
        public User Teacher { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}