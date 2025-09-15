using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace StudentAutomation.Models.Dtos
{
    [SwaggerSchema("User registration data")]
    public class RegisterDto
    {
        [Required(ErrorMessage = "İsim zorunludur.")]
        [SwaggerSchema("Full name of the user (example: John Doe)")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email zorunludur.")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz.")]
        [SwaggerSchema("Email address (must be unique, example: john.doe@example.com)")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre zorunludur.")]
        [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalı.")]
        [SwaggerSchema("Password (minimum 6 characters, example: securepassword123)")]
        public string Password { get; set; } = string.Empty;

        [SwaggerSchema("User role (Admin, Teacher, Student, example: Admin)")]
        public string Role { get; set; } = "Student";
    }
}
