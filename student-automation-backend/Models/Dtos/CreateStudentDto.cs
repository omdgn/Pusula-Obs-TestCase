using System.ComponentModel.DataAnnotations;

namespace StudentAutomation.Models.Dtos
{
    public class CreateStudentDto
    {
        [Required]
        public string StudentNumber { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        [Required]
        public Guid UserId { get; set; }
    }
}
