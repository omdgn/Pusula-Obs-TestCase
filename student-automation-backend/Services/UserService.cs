using Microsoft.EntityFrameworkCore;
using StudentAutomation.Data;
using StudentAutomation.Models;
using StudentAutomation.Models.Dtos;

namespace StudentAutomation.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Student operations
        public async Task<List<User>> GetAllStudentsAsync()
        {
            return await _context.Users
                .Where(u => u.Role == UserRole.Student)
                .ToListAsync();
        }

        public async Task<User?> GetStudentByIdAsync(Guid id)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.Student);
        }

        public async Task<User?> GetStudentByUserIdAsync(Guid userId)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.Role == UserRole.Student);
        }

        public async Task<User> UpdateStudentAsync(Guid id, UpdateStudentDto dto)
        {
            var student = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.Student);
            
            if (student == null) 
                throw new Exception("Öğrenci bulunamadı.");

            if (!string.IsNullOrEmpty(dto.FullName))
                student.FullName = dto.FullName;
                
            if (!string.IsNullOrEmpty(dto.Email))
                student.Email = dto.Email;
                
            if (dto.Phone != null)
                student.Phone = dto.Phone;

            await _context.SaveChangesAsync();
            return student;
        }

        public async Task DeleteStudentAsync(Guid id)
        {
            var student = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.Student);
            
            if (student == null) 
                throw new Exception("Öğrenci bulunamadı.");

            _context.Users.Remove(student);
            await _context.SaveChangesAsync();
        }

        // Teacher operations
        public async Task<User> CreateTeacherAsync(CreateTeacherDto dto)
        {
            // Check if email already exists
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existingUser != null)
                throw new Exception("Bu email zaten kayıtlı.");

            var teacher = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                Department = dto.Department,
                Role = UserRole.Teacher,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _context.Users.Add(teacher);
            await _context.SaveChangesAsync();

            return teacher;
        }

        public async Task<List<User>> GetAllTeachersAsync()
        {
            return await _context.Users
                .Where(u => u.Role == UserRole.Teacher)
                .ToListAsync();
        }

        public async Task<User?> GetTeacherByIdAsync(Guid id)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.Teacher);
        }

        public async Task<User?> GetTeacherByUserIdAsync(Guid userId)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.Role == UserRole.Teacher);
        }

        public async Task<User> UpdateTeacherAsync(Guid id, UpdateTeacherDto dto)
        {
            var teacher = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.Teacher);
            
            if (teacher == null) 
                throw new Exception("Öğretmen bulunamadı.");

            if (!string.IsNullOrEmpty(dto.FullName))
                teacher.FullName = dto.FullName;
                
            if (!string.IsNullOrEmpty(dto.Email))
                teacher.Email = dto.Email;
                
            if (dto.Phone != null)
                teacher.Phone = dto.Phone;
                
            if (dto.Department != null)
                teacher.Department = dto.Department;

            await _context.SaveChangesAsync();
            return teacher;
        }

        public async Task DeleteTeacherAsync(Guid id)
        {
            var teacher = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.Role == UserRole.Teacher);
            
            if (teacher == null) 
                throw new Exception("Öğretmen bulunamadı.");

            _context.Users.Remove(teacher);
            await _context.SaveChangesAsync();
        }

        // General operations
        public async Task<User?> GetUserByIdAsync(Guid id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User> UpdateUserAsync(Guid id, object dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) 
                throw new Exception("Kullanıcı bulunamadı.");

            // Implementation depends on DTO type
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task DeleteUserAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) 
                throw new Exception("Kullanıcı bulunamadı.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}