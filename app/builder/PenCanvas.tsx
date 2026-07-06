"use client";

import { useEffect, useRef, useState } from "react";

interface Point {
  x: number;
  y: number;
  handleIn?: { x: number; y: number };
  handleOut?: { x: number; y: number };
}

interface PenCanvasProps {
  // Trả về chuỗi "d" của thẻ <path> mỗi khi hình vẽ thay đổi
  onChange: (pathD: string) => void;
}

const VIEWBOX = 24; // Cùng hệ tọa độ 24x24 với các icon Feather có sẵn
const HIT_RADIUS = 1; // Bán kính (đơn vị viewBox) để nhận biết click trúng 1 điểm neo
const DRAG_THRESHOLD = 0.15; // Dưới ngưỡng này coi là click thường (góc nhọn), không tạo tay cầm

function formatNumber(n: number) {
  return Math.round(n * 100) / 100;
}

// Dựng chuỗi "d" chuẩn SVG (M / L / C ... Z) từ danh sách điểm neo + tay cầm bezier
function buildPathD(points: Point[], closed: boolean): string {
  if (points.length === 0) return "";

  let d = `M ${formatNumber(points[0].x)} ${formatNumber(points[0].y)}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const c1 = prev.handleOut ?? prev;
    const c2 = curr.handleIn ?? curr;

    if (prev.handleOut || curr.handleIn) {
      d += ` C ${formatNumber(c1.x)} ${formatNumber(c1.y)} ${formatNumber(
        c2.x
      )} ${formatNumber(c2.y)} ${formatNumber(curr.x)} ${formatNumber(curr.y)}`;
    } else {
      d += ` L ${formatNumber(curr.x)} ${formatNumber(curr.y)}`;
    }
  }

  if (closed && points.length > 1) {
    const last = points[points.length - 1];
    const first = points[0];
    const c1 = last.handleOut ?? last;
    const c2 = first.handleIn ?? first;

    if (last.handleOut || first.handleIn) {
      d += ` C ${formatNumber(c1.x)} ${formatNumber(c1.y)} ${formatNumber(
        c2.x
      )} ${formatNumber(c2.y)} ${formatNumber(first.x)} ${formatNumber(
        first.y
      )}`;
    }
    d += " Z";
  }

  return d;
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

type DragState =
  | { type: "none" }
  | { type: "new-point"; index: number }
  | { type: "move-point"; index: number };

export default function PenCanvas({ onChange }: PenCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [closed, setClosed] = useState(false);
  const [drag, setDrag] = useState<DragState>({ type: "none" });

  // Mỗi khi hình thay đổi, báo path "d" mới nhất lên component cha
  useEffect(() => {
    onChange(buildPathD(points, closed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, closed]);

  const toSvgPoint = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VIEWBOX,
      y: ((e.clientY - rect.top) / rect.height) * VIEWBOX,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const pos = toSvgPoint(e);

    // Click gần điểm neo đầu tiên (chưa đóng, đã có >= 3 điểm) -> đóng hình lại
    if (!closed && points.length >= 3 && distance(points[0], pos) < HIT_RADIUS) {
      setClosed(true);
      return;
    }

    // Click trúng 1 điểm neo đã có -> kéo để di chuyển điểm đó (kèm tay cầm)
    const existingIndex = points.findIndex((p) => distance(p, pos) < HIT_RADIUS);
    if (existingIndex !== -1) {
      setDrag({ type: "move-point", index: existingIndex });
      return;
    }

    // Đã đóng hình thì không cho thêm điểm mới nữa
    if (closed) return;

    // Thêm điểm neo mới, đồng thời bắt đầu chế độ kéo để tạo đường cong (nếu có)
    setPoints((prev) => [...prev, { x: pos.x, y: pos.y }]);
    setDrag({ type: "new-point", index: points.length });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (drag.type === "none") return;
    const pos = toSvgPoint(e);

    setPoints((prev) => {
      const point = prev[drag.index];
      if (!point) return prev;
      const next = [...prev];

      if (drag.type === "move-point") {
        const dx = pos.x - point.x;
        const dy = pos.y - point.y;
        next[drag.index] = {
          x: pos.x,
          y: pos.y,
          handleIn: point.handleIn
            ? { x: point.handleIn.x + dx, y: point.handleIn.y + dy }
            : undefined,
          handleOut: point.handleOut
            ? { x: point.handleOut.x + dx, y: point.handleOut.y + dy }
            : undefined,
        };
      } else {
        const dx = pos.x - point.x;
        const dy = pos.y - point.y;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) {
          next[drag.index] = { x: point.x, y: point.y };
        } else {
          next[drag.index] = {
            x: point.x,
            y: point.y,
            handleOut: { x: point.x + dx, y: point.y + dy },
            handleIn: { x: point.x - dx, y: point.y - dy },
          };
        }
      }

      return next;
    });
  };

  const handleMouseUp = () => setDrag({ type: "none" });

  const undoLastPoint = () => {
    if (closed) {
      setClosed(false);
      return;
    }
    setPoints((prev) => prev.slice(0, -1));
  };

  const clearAll = () => {
    setPoints([]);
    setClosed(false);
    setDrag({ type: "none" });
  };

  const closePath = () => {
    if (points.length >= 3) setClosed(true);
  };

  const pathD = buildPathD(points, closed);
  const activePoint = drag.type === "new-point" ? points[drag.index] : undefined;

  return (
    <div className="flex flex-col gap-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        className="w-full aspect-square bg-gray-50 border border-gray-200 rounded-lg cursor-crosshair select-none touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#404E3B"
            strokeWidth={0.3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Tay cầm bezier của điểm đang được kéo, để dễ hình dung đường cong */}
        {activePoint && activePoint.handleOut && activePoint.handleIn && (
          <>
            <line
              x1={activePoint.x}
              y1={activePoint.y}
              x2={activePoint.handleOut.x}
              y2={activePoint.handleOut.y}
              stroke="#7B9669"
              strokeWidth={0.1}
            />
            <line
              x1={activePoint.x}
              y1={activePoint.y}
              x2={activePoint.handleIn.x}
              y2={activePoint.handleIn.y}
              stroke="#7B9669"
              strokeWidth={0.1}
            />
            <circle cx={activePoint.handleOut.x} cy={activePoint.handleOut.y} r={0.2} fill="#7B9669" />
            <circle cx={activePoint.handleIn.x} cy={activePoint.handleIn.y} r={0.2} fill="#7B9669" />
          </>
        )}

        {/* Các điểm neo đã đặt */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === 0 ? 0.45 : 0.3}
            fill={i === 0 ? "#7B9669" : "#404E3B"}
            stroke="white"
            strokeWidth={0.08}
          />
        ))}
      </svg>

      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={undoLastPoint}
          disabled={points.length === 0}
          className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Hoàn tác
        </button>
        <button
          type="button"
          onClick={closePath}
          disabled={closed || points.length < 3}
          className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Đóng hình
        </button>
        <button
          type="button"
          onClick={clearAll}
          disabled={points.length === 0}
          className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Xóa hết
        </button>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        Click để đặt điểm neo. Giữ chuột và kéo lúc đặt điểm để tạo đường cong.
        Click lại điểm đầu tiên (chấm xanh) hoặc bấm &quot;Đóng hình&quot; để
        hoàn tất icon.
      </p>
    </div>
  );
}
