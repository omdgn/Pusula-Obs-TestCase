using System.ComponentModel.DataAnnotations;

namespace StudentAutomation.Models.Dtos
{
    public class AddGradeDto
    {
        [Required(ErrorMessage = "Puan gereklidir.")]
        [Range(0, 100, ErrorMessage = "Puan 0-100 arasında olmalıdır.")]
        public decimal Score { get; set; }

        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Öğrenci ID gereklidir.")]
        public Guid StudentId { get; set; }

        [Required(ErrorMessage = "Ders ID gereklidir.")]
        public Guid CourseId { get; set; }
    }
}