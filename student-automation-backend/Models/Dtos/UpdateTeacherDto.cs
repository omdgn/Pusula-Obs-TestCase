using System.ComponentModel.DataAnnotations;

namespace StudentAutomation.Models.Dtos
{
    public class UpdateTeacherDto
    {
        [Required]
        public string? FullName { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        public string? Phone { get; set; }

        public string? Department { get; set; }
    }
}