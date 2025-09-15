using System.ComponentModel.DataAnnotations;

namespace StudentAutomation.Models.Dtos
{
    public class UpdateCourseStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty; // "NotStarted", "InProgress", "Completed"
    }
}