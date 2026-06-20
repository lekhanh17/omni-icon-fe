"use client"; // Bắt buộc phải có để dùng useState trong Next.js App Router

import { useState } from "react";

export default function BuilderPage() {
  // Khởi tạo các State để lưu trữ thuộc tính của icon
  const [color, setColor] = useState("#3b82f6"); // Mặc định màu xanh
  const [size, setSize] = useState(120); // Kích thước mặc định 120px
  const [strokeWidth, setStrokeWidth] = useState(2); // Độ dày nét vẽ

  return (
    <main className="flex min-h-screen bg-gray-50 p-8 gap-8">
      {/* CỘT TRÁI: Thanh công cụ điều khiển (Sidebar) */}
      <div className="w-80 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Tùy chỉnh Icon</h2>

        {/* Đổi màu sắc */}
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

        {/* Đổi kích thước */}
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

        {/* Đổi độ dày nét */}
        <div className="mb-6">
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

      {/* CỘT PHẢI: Khu vực Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300">
        <h1 className="text-2xl font-bold mb-8 text-gray-400 absolute top-16">
          Workspace
        </h1>

        {/* Thẻ SVG được truyền State vào các thuộc tính */}
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
          {/* Vẫn dùng tạm hình ngôi sao */}
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
    </main>
  );
}
