// src/pages/student/MyGrades.jsx
import { useState, useEffect } from "react";
import Table from "../../components/Table";
import Chart from "../../components/Chart";
import { getMyGrades } from "../../services/studentService";
import {
  BarChart3, TrendingUp, Award
} from "lucide-react";

export default function MyGrades() {
  const [grades, setGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("all");

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        setError(null);
        const gradesData = await getMyGrades();
        setGrades(gradesData);
        setFilteredGrades(gradesData);
      } catch (err) {
        console.error("Grades fetch error:", err);

        if (err.response?.status === 403) {
          setError("Yetki hatası. Lütfen çıkış yapıp tekrar giriş yapın.");
        } else if (err.response?.status === 401) {
          setError("Oturum süresi dolmuş. Yeniden giriş yapın.");
        } else {
          setError("Notlar yüklenirken bir hata oluştu: " + (err.message || "Bilinmeyen hata"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  // Filter grades based on selected course
  useEffect(() => {
    let filtered = grades;

    if (selectedCourse !== "all") {
      filtered = filtered.filter(grade => grade.courseId.toString() === selectedCourse);
    }

    setFilteredGrades(filtered);
  }, [grades, selectedCourse]);

  // Calculate statistics
  const statistics = {
    totalGrades: filteredGrades.length,
    averageScore: filteredGrades.length > 0
      ? Math.round(filteredGrades.reduce((sum, grade) => sum + grade.score, 0) / filteredGrades.length)
      : 0,
    highestScore: filteredGrades.length > 0
      ? Math.max(...filteredGrades.map(grade => grade.score))
      : 0,
    lowestScore: filteredGrades.length > 0
      ? Math.min(...filteredGrades.map(grade => grade.score))
      : 0
  };

  // Prepare chart data
  const chartData = filteredGrades.map((grade, index) => ({
    name: `Not ${index + 1}`,
    score: grade.score,
    course: grade.courseName,
    date: grade.createdAt
  }));

  // Get unique courses for filters
  const courses = [...new Set(grades.map(grade => ({
    id: grade.courseId,
    name: grade.courseName
  })).filter((course, index, arr) =>
    arr.findIndex(c => c.id === course.id) === index
  ))];

  // Table columns
  const columns = [
    {
      header: "Ders",
      key: "courseName",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-600">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {row.courseId}</div>
        </div>
      )
    },
    {
      header: "Puan",
      key: "score",
      render: (value) => (
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-gray-600">
            {value}/100
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            %{value}
          </div>
        </div>
      )
    },
    {
      header: "Harf Notu",
      key: "score",
      render: (value) => {
        const getLetterGrade = (score) => {
          if (score >= 90) return 'A';
          if (score >= 80) return 'B';
          if (score >= 70) return 'C';
          if (score >= 60) return 'D';
          return 'F';
        };

        const getGradeColor = (score) => {
          if (score >= 90) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
          if (score >= 80) return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
          if (score >= 70) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
          if (score >= 60) return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900';
          return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
        };

        const letterGrade = getLetterGrade(value);

        return (
          <div className="text-center">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(value)}`}>
              {letterGrade}
            </span>
          </div>
        );
      }
    },
    {
      header: "Açıklama",
      key: "description",
      render: (value) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
          {value || "Açıklama yok"}
        </div>
      )
    },
    {
      header: "Tarih",
      key: "createdAt",
      render: (value) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString('tr-TR')}
        </div>
      )
    }
  ];

  const handleExport = () => {
    console.log("Exporting grades...");
    // TODO: Implement export functionality
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredGrades(grades);
      return;
    }

    const filtered = grades.filter(grade =>
      grade.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (grade.description && grade.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredGrades(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Yeniden Dene
          </button>
          {(error.includes("Yetki hatası") || error.includes("Oturum süresi")) && (
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Çıkış Yap
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-600">
            Notlarım
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tüm sınav notlarını ve başarı durumunu takip et
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Not</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-600">
                  {statistics.totalGrades}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ortalama</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-600">
                  {statistics.averageScore}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">En Yüksek</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-600">
                  {statistics.highestScore}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">En Düşük</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-600">
                  {statistics.lowestScore}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ders Filtresi
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-600"
              >
                <option value="all">Tüm Dersler</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chart */}
        {filteredGrades.length > 0 && (
          <div className="mb-8">
            <Chart
              type="line"
              data={chartData}
              title="Not Grafiği"
              dataKey="score"
              xAxisKey="name"
              height={300}
              showGrid={true}
              showTooltip={true}
            />
          </div>
        )}

        {/* Grades Table */}
        <Table
          title="Not Listesi"
          columns={columns}
          data={filteredGrades}
          loading={loading}
          searchable={true}
          exportable={true}
          onSearch={handleSearch}
          onExport={handleExport}
          emptyMessage="Henüz not kaydınız bulunmuyor"
        />
      </div>
  );
}