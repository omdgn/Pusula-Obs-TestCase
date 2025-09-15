using Microsoft.EntityFrameworkCore;
using StudentAutomation.Data;
using StudentAutomation.Models;
using StudentAutomation.Models.Dtos;

namespace StudentAutomation.Services
{
    public class CourseService : ICourseService
    {
        private readonly ApplicationDbContext _context;

        public CourseService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Course> CreateCourseAsync(CreateCourseDto dto)
        {
            // Verify teacher exists
            var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.TeacherId && u.Role == UserRole.Teacher);
            if (teacher == null)
                throw new Exception("Belirtilen öğretmen bulunamadı.");

            var course = new Course
            {
                Title = dto.Title,
                Description = dto.Description,
                TeacherId = dto.TeacherId
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            return course;
        }

        public async Task<List<Course>> GetAllCoursesAsync()
        {
            return await _context.Courses
                .Include(c => c.Teacher)
                .Include(c => c.CourseStudents)
                    .ThenInclude(cs => cs.Student)
                .ToListAsync();
        }

        public async Task<Course?> GetCourseByIdAsync(Guid id)
        {
            return await _context.Courses
                .Include(c => c.Teacher)
                .Include(c => c.CourseStudents)
                    .ThenInclude(cs => cs.Student)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<Course>> GetCoursesByTeacherIdAsync(Guid teacherId)
        {
            return await _context.Courses
                .Include(c => c.CourseStudents)
                    .ThenInclude(cs => cs.Student)
                .Where(c => c.TeacherId == teacherId)
                .ToListAsync();
        }

        public async Task<Course> UpdateCourseStatusAsync(Guid id, UpdateCourseStatusDto dto)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
                throw new Exception("Ders bulunamadı.");

            course.Status = dto.Status;
            await _context.SaveChangesAsync();

            return course;
        }

        public async Task DeleteCourseAsync(Guid id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
                throw new Exception("Ders bulunamadı.");

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
        }

        public async Task AddStudentToCourseAsync(Guid courseId, Guid studentId)
        {
            // Check if course exists
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
                throw new Exception("Ders bulunamadı.");

            // Check if student exists and has Student role
            var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == studentId && u.Role == UserRole.Student);
            if (student == null)
                throw new Exception("Öğrenci bulunamadı.");

            // Check if student is already enrolled
            var existingEnrollment = await _context.CourseStudents
                .FirstOrDefaultAsync(cs => cs.CourseId == courseId && cs.StudentId == studentId);
            
            if (existingEnrollment != null)
                throw new Exception("Öğrenci zaten bu derse kayıtlı.");

            var courseStudent = new CourseStudent
            {
                CourseId = courseId,
                StudentId = studentId
            };

            _context.CourseStudents.Add(courseStudent);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveStudentFromCourseAsync(Guid courseId, Guid studentId)
        {
            var courseStudent = await _context.CourseStudents
                .FirstOrDefaultAsync(cs => cs.CourseId == courseId && cs.StudentId == studentId);

            if (courseStudent == null)
                throw new Exception("Öğrenci bu derse kayıtlı değil.");

            _context.CourseStudents.Remove(courseStudent);
            await _context.SaveChangesAsync();
        }

        public async Task<List<User>> GetCourseStudentsAsync(Guid courseId)
        {
            return await _context.CourseStudents
                .Where(cs => cs.CourseId == courseId)
                .Select(cs => cs.Student)
                .ToListAsync();
        }
    }
}