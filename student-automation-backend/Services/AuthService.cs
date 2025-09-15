using BCrypt.Net;
using StudentAutomation.Data;
using StudentAutomation.Models;
using StudentAutomation.Models.Dtos;
using StudentAutomation.Helpers;

namespace StudentAutomation.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtHelper _jwtHelper;

        public AuthService(ApplicationDbContext context, JwtHelper jwtHelper)
        {
            _context = context;
            _jwtHelper = jwtHelper;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            if (_context.Users.Any(u => u.Email == dto.Email))
                throw new Exception("Bu email zaten kayıtlı.");

            var roleParsed = Enum.TryParse<UserRole>(dto.Role, true, out var userRole);
            if (!roleParsed) userRole = UserRole.Student;

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                FullName = dto.FullName,
                Role = userRole,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            // Role-specific fields
            if (userRole == UserRole.Student)
            {
                user.StudentNumber = GenerateStudentNumber();
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _jwtHelper.GenerateJwt(user);

            return new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                Id = user.Id,
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == dto.Email);
            if (user == null)
                throw new Exception("Email veya şifre hatalı.");

            var passwordMatch = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!passwordMatch)
                throw new Exception("Email veya şifre hatalı.");

            var token = _jwtHelper.GenerateJwt(user);

            return new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                Id = user.Id,
            };
        }

        private string GenerateStudentNumber()
        {
            var year = DateTime.Now.Year.ToString();
            var random = new Random().Next(1000, 9999);
            return $"{year}{random}";
        }
    }
}
