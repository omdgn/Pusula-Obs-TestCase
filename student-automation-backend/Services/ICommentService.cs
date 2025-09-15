using StudentAutomation.Models;
using StudentAutomation.Models.Dtos;

namespace StudentAutomation.Services
{
    public interface ICommentService
    {
        Task<Comment> AddCommentAsync(AddCommentDto dto, Guid teacherId);
        Task<Comment> UpdateCommentAsync(Guid commentId, UpdateCommentDto dto, Guid teacherId);
        Task DeleteCommentAsync(Guid commentId, Guid teacherId);
        Task<List<Comment>> GetCommentsByStudentIdAsync(Guid studentId);
        Task<List<Comment>> GetCommentsByTeacherIdAsync(Guid teacherId);
        Task<Comment?> GetCommentByIdAsync(Guid commentId);
    }
}