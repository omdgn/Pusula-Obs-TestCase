using System.ComponentModel.DataAnnotations;

namespace StudentAutomation.Models.Dtos
{
    public class UpdateCommentDto
    {
        [Required(ErrorMessage = "Yorum içeriği gereklidir.")]
        [MinLength(5, ErrorMessage = "Yorum en az 5 karakter olmalıdır.")]
        [MaxLength(1000, ErrorMessage = "Yorum en fazla 1000 karakter olabilir.")]
        public string Content { get; set; } = string.Empty;
    }
}