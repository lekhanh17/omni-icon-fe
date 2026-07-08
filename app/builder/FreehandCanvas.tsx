"use client";

import { useRef, useState } from "react";

interface Vec2 {
  x: number;
  y: number;
}

interface FreehandCanvasProps {
  // Trả về chuỗi "d" của thẻ <path> mỗi khi nét vẽ thay đổi
  onChange: (pathD: string) => void;
}

const VIEWBOX = 24; // Cùng hệ tọa độ 24x24 với Pen Tool và các icon có sẵn
const MIN_SAMPLE_DIST = 0.15; // Khoảng cách tối thiểu giữa 2 điểm lấy mẫu khi kéo chuột
const SIMPLIFY_EPSILON = 0.35; // Sai số cho phép khi rút gọn điểm (càng lớn càng mượt nhưng càng lệch nét gốc)

function formatNumber(n: number) {
  return Math.round(n * 100) / 100;
}

function distance(a: Vec2, b: Vec2) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Rút gọn số điểm thô nhưng vẫn giữ đúng hình dáng nét vẽ (thuật toán Douglas-Peucker)
function simplify(points: Vec2[], epsilon: number): Vec2[] {
  if (points.length < 3) return points;

  const start = points[0];
  const end = points[points.length - 1];
  let maxDist = 0;
  let index = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], start, end);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = simplify(points.slice(0, index + 1), epsilon);
    const right = simplify(points.slice(index), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [start, end];
}

function perpendicularDistance(p: Vec2, a: Vec2, b: Vec2) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const magSq = dx * dx + dy * dy;
  if (magSq === 0) return distance(p, a);

  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / magSq;
  const closest = { x: a.x + t * dx, y: a.y + t * dy };
  return distance(p, closest);
}

// Biến danh sách điểm thành đường cong mượt (Catmull-Rom -> Cubic Bezier)
function smoothPathD(points: Vec2[], closed: boolean): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    return `M ${formatNumber(points[0].x)} ${formatNumber(points[0].y)}`;
  }

  const n = points.length;
  const at = (i: number): Vec2 => {
    if (closed) return points[((i % n) + n) % n];
    if (i < 0) return points[0];
    if (i >= n) return points[n - 1];
    return points[i];
  };

  let d = `M ${formatNumber(points[0].x)} ${formatNumber(points[0].y)}`;
  const segments = closed ? n : n - 1;

  for (let i = 0; i < segments; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${formatNumber(c1x)} ${formatNumber(c1y)} ${formatNumber(
      c2x
    )} ${formatNumber(c2y)} ${formatNumber(p2.x)} ${formatNumber(p2.y)}`;
  }

  if (closed) d += " Z";
  return d;
}

export default function FreehandCanvas({ onChange }: FreehandCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [rawPoints, setRawPoints] = useState<Vec2[]>([]);
  const [finalPoints, setFinalPoints] = useState<Vec2[]>([]);
  const [closed, setClosed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const toSvgPoint = (e: React.MouseEvent): Vec2 => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VIEWBOX,
      y: ((e.clientY - rect.top) / rect.height) * VIEWBOX,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (closed) return; // Đã đóng hình, phải "Vẽ lại" mới vẽ tiếp được
    const pos = toSvgPoint(e);
    setIsDrawing(true);
    setRawPoints([pos]);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const pos = toSvgPoint(e);

    setRawPoints((prev) => {
      const last = prev[prev.length - 1];
      if (last && distance(last, pos) < MIN_SAMPLE_DIST) return prev;
      return [...prev, pos];
    });
  };

  const finishStroke = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const simplified = simplify(rawPoints, SIMPLIFY_EPSILON);
    setFinalPoints(simplified);
    onChange(smoothPathD(simplified, false));
  };

  const closeShape = () => {
    if (finalPoints.length < 3) return;
    setClosed(true);
    onChange(smoothPathD(finalPoints, true));
  };

  const clearAll = () => {
    setRawPoints([]);
    setFinalPoints([]);
    setClosed(false);
    setIsDrawing(false);
    onChange("");
  };

  // Đường hiển thị khi đang kéo chuột: nối thẳng các điểm mẫu thô để phản hồi tức thời
  const livePreviewD =
    isDrawing && rawPoints.length > 0
      ? `M ${formatNumber(rawPoints[0].x)} ${formatNumber(rawPoints[0].y)} ` +
        rawPoints
          .slice(1)
          .map((p) => `L ${formatNumber(p.x)} ${formatNumber(p.y)}`)
          .join(" ")
      : "";

  const finalPathD =
    !isDrawing && finalPoints.length > 0
      ? smoothPathD(finalPoints, closed)
      : "";

  return (
    <div className="flex flex-col gap-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        className="w-full aspect-square bg-gray-50 border border-gray-200 rounded-lg cursor-crosshair select-none touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={finishStroke}
        onMouseLeave={finishStroke}
      >
        {livePreviewD && (
          <path
            d={livePreviewD}
            fill="none"
            stroke="#7B9669"
            strokeWidth={0.3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {finalPathD && (
          <path
            d={finalPathD}
            fill="none"
            stroke="#404E3B"
            strokeWidth={0.3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>

      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={closeShape}
          disabled={closed || finalPoints.length < 3}
          className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Đóng hình
        </button>
        <button
          type="button"
          onClick={clearAll}
          disabled={finalPoints.length === 0 && rawPoints.length === 0}
          className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Vẽ lại
        </button>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        Giữ chuột và kéo để vẽ tự do như bút chì, thả chuột ra là xong nét vẽ
        (hệ thống tự làm mượt lại). Bấm &quot;Đóng hình&quot; để khép kín
        icon.
      </p>
    </div>
  );
}
