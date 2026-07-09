"use client";

import { useState } from "react";

interface IconItem {
  _id: string;
  name: string;
  svgCode: string;
}

export default function PublicIconGrid({ icons }: { icons: IconItem[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (icon: IconItem) => {
    navigator.clipboard.writeText(icon.svgCode);
    setCopiedId(icon._id);
    setTimeout(
      () => setCopiedId((prev) => (prev === icon._id ? null : prev)),
      1500
    );
  };

  if (icons.length === 0) {
    return (
      <p className="text-center text-gray-400 py-16">
        Người dùng này chưa lưu icon nào.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {icons.map((icon) => (
        <div
          key={icon._id}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-jade-200 transition-all p-5 flex flex-col items-center"
        >
          <div
            className="w-16 h-16 flex items-center justify-center mb-4 [&>svg]:w-full [&>svg]:h-full"
            dangerouslySetInnerHTML={{ __html: icon.svgCode }}
          />
          <p className="text-sm font-semibold text-gray-800 text-center truncate w-full mb-3">
            {icon.name}
          </p>
          <button
            onClick={() => handleCopy(icon)}
            className="text-xs bg-jade-50 hover:bg-jade-200/60 text-jade-900 px-3 py-1.5 rounded-full font-semibold transition-colors w-full"
          >
            {copiedId === icon._id ? "Đã copy!" : "Copy SVG"}
          </button>
        </div>
      ))}
    </div>
  );
}
