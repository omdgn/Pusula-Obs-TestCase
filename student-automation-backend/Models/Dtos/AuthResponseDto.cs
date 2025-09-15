namespace StudentAutomation.Models.Dtos
{
    public class AuthResponseDto
    {
        public Guid Id { get; set; } 
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
