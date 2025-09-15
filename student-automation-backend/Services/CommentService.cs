using Microsoft.EntityFrameworkCore;
using StudentAutomation.Data;
using StudentAutomation.Models;
using StudentAutomation.Models.Dtos;

namespace StudentAutomation.Services
{
    public class CommentService : ICommentService
    {
        private readonly ApplicationDbContext _context;

        public CommentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Comment> AddCommentAsync(AddCommentDto dto, Guid teacherId)
        {
            // Verify student exists
            var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.StudentId && u.Role == UserRole.Student);
            if (student == null)
                throw new Exception("Öğrenci bulunamadı.");

            // Verify teacher exists
            var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Id == teacherId && u.Role == UserRole.Teacher);
            if (teacher == null)
                throw new Exception("Öğretmen bulunamadı.");

            var comment = new Comment
            {
                Content = dto.Content,
                StudentId = dto.StudentId,
                TeacherId = teacherId
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            // Load navigation properties
            await _context.Entry(comment)
                .Reference(c => c.Student)
                .LoadAsync();
            await _context.Entry(comment)
                .Reference(c => c.Teacher)
                .LoadAsync();

            return comment;
        }

        public async Task<Comment> UpdateCommentAsync(Guid commentId, UpdateCommentDto dto, Guid teacherId)
        {
            var comment = await _context.Comments.FirstOrDefaultAsync(c => c.Id == commentId && c.TeacherId == teacherId);
            if (comment == null)
                throw new Exception("Yorum bulunamadı veya bu yoruma erişim yetkiniz yok.");

            comment.Content = dto.Content;
            comment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Load navigation properties
            await _context.Entry(comment)
                .Reference(c => c.Student)
                .LoadAsync();
            await _context.Entry(comment)
                .Reference(c => c.Teacher)
                .LoadAsync();

            return comment;
        }

        public async Task DeleteCommentAsync(Guid commentId, Guid teacherId)
        {
            var comment = await _context.Comments.FirstOrDefaultAsync(c => c.Id == commentId && c.TeacherId == teacherId);
            if (comment == null)
                throw new Exception("Yorum bulunamadı veya bu yoruma erişim yetkiniz yok.");

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Comment>> GetCommentsByStudentIdAsync(Guid studentId)
        {
            return await _context.Comments
                .Include(c => c.Teacher)
                .Where(c => c.StudentId == studentId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Comment>> GetCommentsByTeacherIdAsync(Guid teacherId)
        {
            return await _context.Comments
                .Include(c => c.Student)
                .Where(c => c.TeacherId == teacherId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Comment?> GetCommentByIdAsync(Guid commentId)
        {
            return await _context.Comments
                .Include(c => c.Student)
                .Include(c => c.Teacher)
                .FirstOrDefaultAsync(c => c.Id == commentId);
        }
    }
}