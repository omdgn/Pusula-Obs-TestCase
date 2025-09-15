using Microsoft.EntityFrameworkCore;
using StudentAutomation.Data;
using StudentAutomation.Models;
using StudentAutomation.Models.Dtos;

namespace StudentAutomation.Services
{
    public class GradeService : IGradeService
    {
        private readonly ApplicationDbContext _context;

        public GradeService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Grade> AddGradeAsync(AddGradeDto dto, Guid teacherId)
        {
            // Verify student exists
            var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.StudentId && u.Role == UserRole.Student);
            if (student == null)
                throw new Exception("Öğrenci bulunamadı.");

            // Verify course exists and teacher is assigned to it
            var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == dto.CourseId && c.TeacherId == teacherId);
            if (course == null)
                throw new Exception("Ders bulunamadı veya bu derse erişim yetkiniz yok.");

            // Verify student is enrolled in the course
            var enrollment = await _context.CourseStudents
                .FirstOrDefaultAsync(cs => cs.CourseId == dto.CourseId && cs.StudentId == dto.StudentId);
            if (enrollment == null)
                throw new Exception("Öğrenci bu derse kayıtlı değil.");

            var grade = new Grade
            {
                Score = dto.Score,
                Description = dto.Description,
                StudentId = dto.StudentId,
                CourseId = dto.CourseId,
                TeacherId = teacherId
            };

            _context.Grades.Add(grade);
            await _context.SaveChangesAsync();

            // Load navigation properties
            await _context.Entry(grade)
                .Reference(g => g.Student)
                .LoadAsync();
            await _context.Entry(grade)
                .Reference(g => g.Course)
                .LoadAsync();
            await _context.Entry(grade)
                .Reference(g => g.Teacher)
                .LoadAsync();

            return grade;
        }

        public async Task<Grade> UpdateGradeAsync(Guid gradeId, UpdateGradeDto dto, Guid teacherId)
        {
            var grade = await _context.Grades.FirstOrDefaultAsync(g => g.Id == gradeId && g.TeacherId == teacherId);
            if (grade == null)
                throw new Exception("Not bulunamadı veya bu nota erişim yetkiniz yok.");

            grade.Score = dto.Score;
            grade.Description = dto.Description;

            await _context.SaveChangesAsync();

            // Load navigation properties
            await _context.Entry(grade)
                .Reference(g => g.Student)
                .LoadAsync();
            await _context.Entry(grade)
                .Reference(g => g.Course)
                .LoadAsync();

            return grade;
        }

        public async Task DeleteGradeAsync(Guid gradeId, Guid teacherId)
        {
            var grade = await _context.Grades.FirstOrDefaultAsync(g => g.Id == gradeId && g.TeacherId == teacherId);
            if (grade == null)
                throw new Exception("Not bulunamadı veya bu nota erişim yetkiniz yok.");

            _context.Grades.Remove(grade);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Grade>> GetGradesByStudentIdAsync(Guid studentId)
        {
            return await _context.Grades
                .Include(g => g.Course)
                .Include(g => g.Teacher)
                .Where(g => g.StudentId == studentId)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Grade>> GetGradesByCourseIdAsync(Guid courseId, Guid teacherId)
        {
            // Verify teacher has access to this course
            var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId && c.TeacherId == teacherId);
            if (course == null)
                throw new Exception("Ders bulunamadı veya bu derse erişim yetkiniz yok.");

            return await _context.Grades
                .Include(g => g.Student)
                .Where(g => g.CourseId == courseId)
                .OrderBy(g => g.Student.FullName)
                .ToListAsync();
        }

        public async Task<Grade?> GetGradeByIdAsync(Guid gradeId)
        {
            return await _context.Grades
                .Include(g => g.Student)
                .Include(g => g.Course)
                .Include(g => g.Teacher)
                .FirstOrDefaultAsync(g => g.Id == gradeId);
        }
    }
}