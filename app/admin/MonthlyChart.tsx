export interface MonthlyDataPoint {
  label: string;
  users: number;
  icons: number;
}

interface Props {
  data: MonthlyDataPoint[];
}

// Biểu đồ cột so sánh Người dùng mới / Icon mới theo từng tháng.
// Vẽ bằng SVG thuần (không phụ thuộc thư viện ngoài) để không cần cài thêm gói npm.
export default function MonthlyChart({ data }: Props) {
  const chartHeight = 200;
  const barGroupWidth = 90;
  const barWidth = 24;
  const gap = 6;
  const width = Math.max(data.length * barGroupWidth, 1);
  const maxValue = Math.max(1, ...data.flatMap((d) => [d.users, d.icons]));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Tăng trưởng theo tháng
        </h2>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-jade-900 inline-block" />
            Người dùng mới
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-jade-500 inline-block" />
            Icon mới
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${chartHeight + 30}`}
          className="w-full"
          style={{ minWidth: width, height: chartHeight + 30 }}
        >
          {/* Đường lưới ngang */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={0}
              x2={width}
              y1={chartHeight - chartHeight * f}
              y2={chartHeight - chartHeight * f}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
          ))}

          {data.map((d, i) => {
            const groupX = i * barGroupWidth + (barGroupWidth - (barWidth * 2 + gap)) / 2;
            const usersHeight = (d.users / maxValue) * chartHeight;
            const iconsHeight = (d.icons / maxValue) * chartHeight;

            return (
              <g key={d.label}>
                <rect
                  x={groupX}
                  y={chartHeight - usersHeight}
                  width={barWidth}
                  height={usersHeight}
                  rx={4}
                  fill="#404E3B"
                />
                <text
                  x={groupX + barWidth / 2}
                  y={chartHeight - usersHeight - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#404E3B"
                  fontWeight={700}
                >
                  {d.users > 0 ? d.users : ""}
                </text>

                <rect
                  x={groupX + barWidth + gap}
                  y={chartHeight - iconsHeight}
                  width={barWidth}
                  height={iconsHeight}
                  rx={4}
                  fill="#7B9669"
                />
                <text
                  x={groupX + barWidth + gap + barWidth / 2}
                  y={chartHeight - iconsHeight - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#7B9669"
                  fontWeight={700}
                >
                  {d.icons > 0 ? d.icons : ""}
                </text>

                <text
                  x={i * barGroupWidth + barGroupWidth / 2}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#6b7280"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
