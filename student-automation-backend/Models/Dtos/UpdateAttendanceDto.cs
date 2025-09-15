using System.ComponentModel.DataAnnotations;

namespace StudentAutomation.Models.Dtos
{
    public class UpdateAttendanceDto
    {
        [Required(ErrorMessage = "Devamsızlık durumu gereklidir.")]
        public AttendanceStatus Status { get; set; }

        public string Notes { get; set; } = string.Empty;
    }
}