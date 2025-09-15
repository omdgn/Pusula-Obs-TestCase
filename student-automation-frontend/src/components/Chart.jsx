// src/components/Chart.jsx
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { useTheme } from "../context/ThemeContext";

export default function Chart({
  type = "line",
  data = [],
  title,
  height = 300,
  dataKey,
  xAxisKey = "name",
  colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"],
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  gradient = false,
  className = ""
}) {
  const { isDark } = useTheme();

  const chartConfig = {
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
    grid: {
      strokeDasharray: "3 3",
      stroke: isDark ? "#374151" : "#e5e7eb"
    },
    axis: {
      tick: { fontSize: 12, fill: isDark ? "#9ca3af" : "#6b7280" },
      axisLine: { stroke: isDark ? "#4b5563" : "#d1d5db" }
    },
    tooltip: {
      contentStyle: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
        borderRadius: 8,
        color: isDark ? "#f9fafb" : "#111827",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }
    }
  };

  const renderChart = () => {
    switch (type) {
      case "area":
        return (
          <AreaChart data={data} margin={chartConfig.margin}>
            {showGrid && <CartesianGrid {...chartConfig.grid} />}
            <XAxis dataKey={xAxisKey} {...chartConfig.axis} />
            <YAxis {...chartConfig.axis} />
            {showTooltip && <Tooltip {...chartConfig.tooltip} />}
            {showLegend && <Legend />}
            <defs>
              {gradient && (
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1} />
                </linearGradient>
              )}
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              fill={gradient ? "url(#colorGradient)" : colors[0]}
              fillOpacity={gradient ? 1 : 0.3}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart data={data} margin={chartConfig.margin}>
            {showGrid && <CartesianGrid {...chartConfig.grid} />}
            <XAxis dataKey={xAxisKey} {...chartConfig.axis} />
            <YAxis {...chartConfig.axis} />
            {showTooltip && <Tooltip {...chartConfig.tooltip} />}
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case "pie":
        return (
          <PieChart margin={chartConfig.margin}>
            {showTooltip && <Tooltip {...chartConfig.tooltip} />}
            {showLegend && <Legend />}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill={colors[0]}
              dataKey={dataKey}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
          </PieChart>
        );

      case "line":
      default:
        return (
          <LineChart data={data} margin={chartConfig.margin}>
            {showGrid && <CartesianGrid {...chartConfig.grid} />}
            <XAxis dataKey={xAxisKey} {...chartConfig.axis} />
            <YAxis {...chartConfig.axis} />
            {showTooltip && <Tooltip {...chartConfig.tooltip} />}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              strokeWidth={3}
              dot={{ r: 6, fill: colors[0], stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 8, fill: colors[1] || colors[0] }}
            />
          </LineChart>
        );
    }
  };

  if (!data || data.length === 0) {
    return (
      <div
        className={`rounded-2xl p-6 shadow-md border ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } ${className}`}
      >
        {title && (
          <h3
            className={`text-lg font-semibold mb-4 ${
              isDark ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
        )}
        <div
          className={`h-${height} flex items-center justify-center text-sm ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
          style={{ height: `${height}px` }}
        >
          Grafik verisi bulunamad1
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-6 shadow-md border ${
        isDark
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      } ${className}`}
    >
      {title && (
        <h3
          className={`text-lg font-semibold mb-4 ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
      )}
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}