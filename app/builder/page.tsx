"use client";

import { useState } from "react";

export default function BuilderPage() {
  const [color, setColor] = useState("#3b82f6");
  const [size, setSize] = useState(120);
  const [strokeWidth, setStrokeWidth] = useState(2);

  // Thuật toán sinh code tự động dựa trên State hiện tại
  const generatedCode = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${size}"
  height="${size}"
  viewBox="0 0 24 24"
  fill="none"
  stroke="${color}"
  strokeWidth="${strokeWidth}"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
</svg>`;

  return (
    <main className="flex min-h-screen bg-gray-50 p-8 gap-8">
      {/* CỘT TRÁI: Khu vực công cụ & Sinh code */}
      <div className="w-80 flex flex-col gap-6">
        {/* Bảng tùy chỉnh */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            Tùy chỉnh Icon
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Màu sắc
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-gray-600 font-mono text-sm">{color}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kích thước: {size}px
            </label>
            <input
              type="range"
              min="24"
              max="240"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ dày nét: {strokeWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Bảng xuất Code tự động */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
              Export Code
            </h2>
            <button
              onClick={() => navigator.clipboard.writeText(generatedCode)}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors font-semibold"
            >
              Copy SVG
            </button>
          </div>
          {/* Vùng hiển thị code với font chữ của dân IT */}
          <pre className="text-gray-300 text-xs font-mono overflow-x-auto p-4 bg-gray-900 rounded-lg border border-gray-700">
            <code>{generatedCode}</code>
          </pre>
        </div>
      </div>

      {/* CỘT PHẢI: Khu vực Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 relative">
        <h1 className="text-2xl font-bold mb-8 text-gray-400 absolute top-8">
          Workspace
        </h1>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-200 ease-in-out"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
    </main>
  );
}
