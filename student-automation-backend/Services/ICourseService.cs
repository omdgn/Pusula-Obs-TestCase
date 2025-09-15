using StudentAutomation.Models;
using StudentAutomation.Models.Dtos;

namespace StudentAutomation.Services
{
    public interface ICourseService
    {
        // Basic CRUD
        Task<Course> CreateCourseAsync(CreateCourseDto dto);
        Task<List<Course>> GetAllCoursesAsync();
        Task<Course?> GetCourseByIdAsync(Guid id);
        Task<List<Course>> GetCoursesByTeacherIdAsync(Guid teacherId);
        Task<Course> UpdateCourseStatusAsync(Guid id, UpdateCourseStatusDto dto);
        Task DeleteCourseAsync(Guid id);

        // Student management
        Task AddStudentToCourseAsync(Guid courseId, Guid studentId);
        Task RemoveStudentFromCourseAsync(Guid courseId, Guid studentId);
        Task<List<User>> GetCourseStudentsAsync(Guid courseId);
    }
}