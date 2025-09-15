using System;
using System.ComponentModel.DataAnnotations;

namespace StudentAutomation.Models
{
    public enum UserRole
    {
        Admin,
        Teacher,
        Student
    }

    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        public required string PasswordHash { get; set; }

        [Required]
        public required UserRole Role { get; set; }

        [Required]
        public required string FullName { get; set; }

        // Common fields for all users
        public string Phone { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Student specific fields
        public string? StudentNumber { get; set; }

        // Teacher specific fields  
        public string? Department { get; set; }
    }
}
