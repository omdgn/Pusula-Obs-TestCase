using StudentAutomation.Models;
using StudentAutomation.Models.Dtos;

namespace StudentAutomation.Services
{
    public interface IUserService
    {
        // Student operations
        Task<List<User>> GetAllStudentsAsync();
        Task<User?> GetStudentByIdAsync(Guid id);
        Task<User?> GetStudentByUserIdAsync(Guid userId);
        Task<User> UpdateStudentAsync(Guid id, UpdateStudentDto dto);
        Task DeleteStudentAsync(Guid id);

        // Teacher operations
        Task<User> CreateTeacherAsync(CreateTeacherDto dto);
        Task<List<User>> GetAllTeachersAsync();
        Task<User?> GetTeacherByIdAsync(Guid id);
        Task<User?> GetTeacherByUserIdAsync(Guid userId);
        Task<User> UpdateTeacherAsync(Guid id, UpdateTeacherDto dto);
        Task DeleteTeacherAsync(Guid id);

        // General user operations
        Task<User?> GetUserByIdAsync(Guid id);
        Task<User> UpdateUserAsync(Guid id, object dto);
        Task DeleteUserAsync(Guid id);
    }
}