"use client";

import { useState } from "react";
import Link from "next/link";

interface IconItem {
  _id: string;
  name: string;
  svgCode: string;
}

interface Props {
  collectionId: string;
  initialName: string;
  icons: IconItem[];
}

export default function CollectionDetailClient({
  collectionId,
  initialName,
  icons: initialIcons,
}: Props) {
  const [name, setName] = useState(initialName);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(initialName);
  const [savingName, setSavingName] = useState(false);
  const [icons, setIcons] = useState(initialIcons);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === name) {
      setEditingName(false);
      return;
    }

    setSavingName(true);
    try {
      const res = await fetch(`/api/me/collections/${collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        setName(trimmed);
      }
    } finally {
      setSavingName(false);
      setEditingName(false);
    }
  };

  const handleRemoveIcon = async (iconId: string) => {
    const prev = icons;
    setIcons((cur) => cur.filter((i) => i._id !== iconId));
    try {
      const res = await fetch(`/api/me/collections/${collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeIconId: iconId }),
      });
      if (!res.ok) setIcons(prev);
    } catch {
      setIcons(prev);
    }
  };

  return (
    <div className="mt-6">
      {editingName ? (
        <form onSubmit={handleRename} className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            maxLength={60}
            autoFocus
            className="text-3xl font-extrabold text-jade-900 bg-transparent border-b-2 border-jade-300 focus:outline-none"
          />
          <button
            type="submit"
            disabled={savingName}
            className="text-sm font-semibold text-jade-700 hover:underline disabled:opacity-40"
          >
            Lưu
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-extrabold text-jade-900">{name}</h1>
          <button
            type="button"
            onClick={() => {
              setNameDraft(name);
              setEditingName(true);
            }}
            className="text-xs font-semibold text-gray-400 hover:text-jade-700 transition-colors"
          >
            Đổi tên
          </button>
        </div>
      )}
      <p className="text-lg text-gray-600 mb-10">
        {icons.length} icon trong bộ sưu tập này.
      </p>

      {icons.length === 0 ? (
        <p className="text-center text-gray-400 py-16">
          Bộ sưu tập này chưa có icon nào. Vào trang chi tiết 1 icon và bấm
          &quot;+ Bộ sưu tập&quot; để thêm.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {icons.map((icon) => (
            <div
              key={icon._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col items-center"
            >
              <Link
                href={`/icon/${icon._id}`}
                className="w-full flex flex-col items-center group"
              >
                <div
                  className="w-16 h-16 flex items-center justify-center mb-4 [&>svg]:w-full [&>svg]:h-full group-hover:scale-110 transition-transform"
                  dangerouslySetInnerHTML={{ __html: icon.svgCode }}
                />
                <p className="text-sm font-semibold text-gray-800 text-center truncate w-full mb-3 group-hover:text-jade-700 transition-colors">
                  {icon.name}
                </p>
              </Link>
              <button
                type="button"
                onClick={() => handleRemoveIcon(icon._id)}
                className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
              >
                Gỡ khỏi bộ sưu tập
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
