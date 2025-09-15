using System.ComponentModel.DataAnnotations;

namespace StudentAutomation.Models
{
    public class Comment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public Guid StudentId { get; set; }
        public User Student { get; set; } = null!;

        [Required]
        public Guid TeacherId { get; set; }
        public User Teacher { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}