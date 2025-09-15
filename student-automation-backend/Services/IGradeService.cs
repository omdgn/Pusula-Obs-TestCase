using StudentAutomation.Models;
using StudentAutomation.Models.Dtos;

namespace StudentAutomation.Services
{
    public interface IGradeService
    {
        Task<Grade> AddGradeAsync(AddGradeDto dto, Guid teacherId);
        Task<Grade> UpdateGradeAsync(Guid gradeId, UpdateGradeDto dto, Guid teacherId);
        Task DeleteGradeAsync(Guid gradeId, Guid teacherId);
        Task<List<Grade>> GetGradesByStudentIdAsync(Guid studentId);
        Task<List<Grade>> GetGradesByCourseIdAsync(Guid courseId, Guid teacherId);
        Task<Grade?> GetGradeByIdAsync(Guid gradeId);
    }
}