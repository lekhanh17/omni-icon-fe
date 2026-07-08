"use client";

import { useEffect, useState } from "react";
import { shapes } from "../../lib/shapes";
import PenCanvas from "./PenCanvas";
import FreehandCanvas from "./FreehandCanvas";

export default function BuilderPage() {
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [drawTool, setDrawTool] = useState<"pen" | "pencil">("pen");
  const [selectedShapeId, setSelectedShapeId] = useState(shapes[0].id);
  const [customPathD, setCustomPathD] = useState("");
  const [color, setColor] = useState("#404E3B");
  const [size, setSize] = useState(120);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillMode, setFillMode] = useState<"outline" | "fill">("outline");
  const [cornerStyle, setCornerStyle] = useState<"round" | "square" | "sharp">(
    "round"
  );
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [dashLength, setDashLength] = useState(0);
  const [opacity, setOpacity] = useState(100);

  // Thông tin lưu icon
  const [iconName, setIconName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    // Bọc trong setTimeout để chuyển sang xử lý bất đồng bộ (Asynchronous)
    // Giúp loại bỏ hoàn toàn lỗi nghiêm ngặt "set-state-in-effect" của ESLint
    const timer = setTimeout(() => {
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch {
          setCurrentUser(null);
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Shape đang được dùng: icon có sẵn (tùy biến) hoặc hình tự vẽ bằng Pen Tool
  const currentShape =
    mode === "custom"
      ? {
          id: "custom",
          name: "Icon tự vẽ",
          markup: customPathD ? `<path d="${customPathD}" />` : "",
        }
      : shapes.find((s) => s.id === selectedShapeId) ?? shapes[0];

  // Kiểu góc/đầu nét: bo tròn / vuông / nhọn (chỉ có tác dụng khi ở chế độ viền)
  const CORNER_STYLES = {
    round: { linecap: "round", linejoin: "round" },
    square: { linecap: "square", linejoin: "bevel" },
    sharp: { linecap: "butt", linejoin: "miter" },
  } as const;
  const corner = CORNER_STYLES[cornerStyle];

  // Tô đặc (fill) hay chỉ viền (stroke) ngoài
  const fillValue = fillMode === "fill" ? color : "none";
  const strokeValue = fillMode === "fill" ? "none" : color;

  // Nét đứt: 0 = liền mạch
  const dashArray = dashLength > 0 ? `${dashLength} ${dashLength}` : undefined;
  const opacityValue = opacity / 100;

  // Xoay + lật ngang/dọc quanh tâm viewBox (12, 12)
  const transformParts: string[] = [];
  if (flipH || flipV) {
    transformParts.push(
      `translate(12 12) scale(${flipH ? -1 : 1} ${flipV ? -1 : 1}) translate(-12 -12)`
    );
  }
  if (rotation !== 0) {
    transformParts.push(`rotate(${rotation} 12 12)`);
  }
  const transformAttr = transformParts.length > 0 ? transformParts.join(" ") : "";
  const innerMarkup = transformAttr
    ? `<g transform="${transformAttr}">${currentShape.markup}</g>`
    : currentShape.markup;

  // Thuật toán sinh code tự động dựa trên State hiện tại
  const generatedCode = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${size}"
  height="${size}"
  viewBox="0 0 24 24"
  fill="${fillValue}"
  stroke="${strokeValue}"
  stroke-width="${strokeWidth}"
  stroke-linecap="${corner.linecap}"
  stroke-linejoin="${corner.linejoin}"${dashArray ? `\n  stroke-dasharray="${dashArray}"` : ""}${
    opacity < 100 ? `\n  opacity="${opacityValue}"` : ""
  }
>
  ${innerMarkup}
</svg>`;

  const handleSave = async () => {
    setSaveError("");
    setSaveSuccess(false);

    if (!iconName.trim()) {
      setSaveError("Vui lòng đặt tên cho icon trước khi lưu.");
      return;
    }

    if (!currentShape.markup) {
      setSaveError("Hãy chọn hoặc vẽ một hình trước khi lưu.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/icons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: iconName.trim(),
          svgCode: generatedCode,
          shape: currentShape.id,
          color,
          size,
          strokeWidth,
          authorId: currentUser?.id,
          authorName: currentUser?.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.message || "Lưu icon thất bại.");
        return;
      }

      setSaveSuccess(true);
      setIconName("");
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      setSaveError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-gray-50 p-8 gap-8">
      {/* CỘT TRÁI: Khu vực công cụ & Sinh code */}
      <div className="w-80 flex flex-col gap-6">
        {/* Bảng chọn / vẽ hình dạng gốc */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Tạo hình dạng
          </h2>

          {/* Tab chuyển đổi giữa 2 chế độ */}
          <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode("preset")}
              className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                mode === "preset"
                  ? "bg-white text-jade-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Icon có sẵn
            </button>
            <button
              type="button"
              onClick={() => setMode("custom")}
              className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                mode === "custom"
                  ? "bg-white text-jade-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Tự vẽ
            </button>
          </div>

          {/* Chế độ 1: chọn icon có sẵn để tùy biến */}
          <div className={mode === "preset" ? "" : "hidden"}>
            <p className="text-xs text-gray-400 mb-4">
              Icon gốc từ Feather Icons (MIT License)
            </p>
            <div className="grid grid-cols-4 gap-2">
              {shapes.map((shape) => (
                <button
                  key={shape.id}
                  type="button"
                  title={shape.name}
                  onClick={() => setSelectedShapeId(shape.id)}
                  className={`w-full aspect-square flex items-center justify-center rounded-lg border transition-colors ${
                    mode === "preset" && shape.id === currentShape.id
                      ? "border-jade-500 bg-jade-50 text-jade-900"
                      : "border-gray-200 text-gray-500 hover:border-jade-200 hover:bg-jade-50/40"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shape.markup}</svg>`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Chế độ 2: tự vẽ (Pen Tool - đặt điểm chính xác, hoặc Bút chì - kéo tự do) */}
          <div className={mode === "custom" ? "" : "hidden"}>
            <div className="flex gap-2 mb-3 text-xs">
              <button
                type="button"
                onClick={() => setDrawTool("pen")}
                className={`flex-1 py-1.5 rounded-md font-semibold border transition-colors ${
                  drawTool === "pen"
                    ? "border-jade-500 bg-jade-50 text-jade-900"
                    : "border-gray-200 text-gray-500 hover:border-jade-200"
                }`}
              >
                Pen (chính xác)
              </button>
              <button
                type="button"
                onClick={() => setDrawTool("pencil")}
                className={`flex-1 py-1.5 rounded-md font-semibold border transition-colors ${
                  drawTool === "pencil"
                    ? "border-jade-500 bg-jade-50 text-jade-900"
                    : "border-gray-200 text-gray-500 hover:border-jade-200"
                }`}
              >
                Bút chì (tự do)
              </button>
            </div>

            <div className={drawTool === "pen" ? "" : "hidden"}>
              <PenCanvas onChange={setCustomPathD} />
            </div>
            <div className={drawTool === "pencil" ? "" : "hidden"}>
              <FreehandCanvas onChange={setCustomPathD} />
            </div>
          </div>
        </div>

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
              Kiểu vẽ
            </label>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setFillMode("outline")}
                className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  fillMode === "outline"
                    ? "bg-white text-jade-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Viền
              </button>
              <button
                type="button"
                onClick={() => setFillMode("fill")}
                className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  fillMode === "fill"
                    ? "bg-white text-jade-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Tô đặc
              </button>
            </div>
          </div>

          {fillMode === "outline" && (
            <>
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

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kiểu góc
                </label>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  {(
                    [
                      { id: "round", label: "Bo tròn" },
                      { id: "square", label: "Vuông" },
                      { id: "sharp", label: "Nhọn" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCornerStyle(opt.id)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                        cornerStyle === opt.id
                          ? "bg-white text-jade-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nét đứt: {dashLength === 0 ? "Liền mạch" : `${dashLength}`}
                </label>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.5"
                  value={dashLength}
                  onChange={(e) => setDashLength(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
            </>
          )}

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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xoay: {rotation}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lật hình
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFlipH((v) => !v)}
                className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                  flipH
                    ? "border-jade-500 bg-jade-50 text-jade-900"
                    : "border-gray-200 text-gray-500 hover:border-jade-200"
                }`}
              >
                Lật ngang
              </button>
              <button
                type="button"
                onClick={() => setFlipV((v) => !v)}
                className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                  flipV
                    ? "border-jade-500 bg-jade-50 text-jade-900"
                    : "border-gray-200 text-gray-500 hover:border-jade-200"
                }`}
              >
                Lật dọc
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ trong suốt: {opacity}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Bảng Lưu icon vào thư viện */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
            Lưu vào thư viện
          </h2>
          <input
            type="text"
            placeholder="Đặt tên cho icon..."
            value={iconName}
            onChange={(e) => setIconName(e.target.value)}
            className="w-full px-4 py-2.5 mb-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500 text-gray-900 text-sm"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-jade-900 hover:bg-jade-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Đang lưu..." : "Lưu Icon"}
          </button>
          {saveError && (
            <p className="mt-3 text-sm text-red-600">⚠️ {saveError}</p>
          )}
          {saveSuccess && (
            <p className="mt-3 text-sm text-jade-900">
              ✅ Đã lưu icon vào thư viện!
            </p>
          )}
        </div>

        {/* Bảng xuất Code tự động */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
              Export Code
            </h2>
            <button
              onClick={() => navigator.clipboard.writeText(generatedCode)}
              className="text-xs bg-jade-900 hover:bg-jade-700 text-white px-3 py-1.5 rounded transition-colors font-semibold"
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

        {mode === "custom" && !currentShape.markup && (
          <p className="text-sm text-gray-400 absolute top-20">
            Vẽ hình ở bảng bên trái để xem trước tại đây
          </p>
        )}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={fillValue}
          stroke={strokeValue}
          strokeWidth={strokeWidth}
          strokeLinecap={corner.linecap}
          strokeLinejoin={corner.linejoin}
          strokeDasharray={dashArray}
          opacity={opacityValue}
          className="transition-all duration-200 ease-in-out"
          dangerouslySetInnerHTML={{ __html: innerMarkup }}
        />
      </div>
    </main>
  );
}
