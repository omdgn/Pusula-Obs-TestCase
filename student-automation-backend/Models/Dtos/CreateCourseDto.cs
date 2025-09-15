using System.ComponentModel.DataAnnotations;

namespace StudentAutomation.Models.Dtos
{
    public class CreateCourseDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public Guid TeacherId { get; set; }
    }
}