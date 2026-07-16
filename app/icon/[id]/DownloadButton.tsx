"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  svgCode: string;
  fileName: string;
}

const PNG_SIZES = [16, 32, 64, 128, 256, 512];

function slugify(str: string): string {
  const cleaned = str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return cleaned || "icon";
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Nút "Tải xuống" - xuất icon ra file SVG hoặc PNG (nhiều kích cỡ), xử lý hoàn
// toàn ở phía trình duyệt (canvas), không cần gọi server.
export default function DownloadButton({ svgCode, fileName }: Props) {
  const [open, setOpen] = useState(false);
  const [renderingSize, setRenderingSize] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const slug = slugify(fileName);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadSvg = () => {
    const blob = new Blob([svgCode], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${slug}.svg`);
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const handleDownloadPng = (size: number) => {
    setRenderingSize(size);
    const svgBlob = new Blob([svgCode], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);

      if (!ctx) {
        setRenderingSize(null);
        return;
      }

      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      canvas.toBlob((blob) => {
        setRenderingSize(null);
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        triggerDownload(pngUrl, `${slug}-${size}.png`);
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
    };

    img.onerror = () => {
      setRenderingSize(null);
      URL.revokeObjectURL(url);
    };

    img.src = url;
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-jade-900 hover:bg-jade-700 text-white font-semibold text-sm transition-colors"
      >
        {renderingSize ? "Đang xử lý..." : "Tải xuống"}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 left-0 w-52 bg-white border border-gray-200 rounded-xl shadow-lg p-2 animate-fade-in-up">
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="w-full text-left text-sm font-semibold text-gray-700 hover:bg-jade-50/60 px-3 py-2 rounded-lg transition-colors"
          >
            Tải SVG
          </button>

          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-3 pt-2 pb-1">
            Tải PNG
          </p>
          <div className="grid grid-cols-3 gap-1 px-1 pb-1">
            {PNG_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleDownloadPng(size)}
                className="text-xs text-gray-600 hover:bg-jade-50/60 hover:text-jade-900 px-2 py-1.5 rounded-lg transition-colors"
              >
                {size}px
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
