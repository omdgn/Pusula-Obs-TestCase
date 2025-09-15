using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace StudentAutomation.Models.Dtos
{
    [SwaggerSchema("Login credentials for user authentication")]
    public class LoginDto
    {
        [Required(ErrorMessage = "Email zorunludur.")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz.")]
        [SwaggerSchema("User's email address (example: admin@example.com)")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre zorunludur.")]
        [SwaggerSchema("User's password (minimum 6 characters, example: password123)")]
        public string Password { get; set; } = string.Empty;
    }
}
