"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { categories } from "../../../lib/categories";

interface Props {
  iconId: string;
  currentUserId?: string;
  authorId?: string;
  initialName: string;
  initialCategory: string;
  initialTags: string[];
  initialSvgCode: string;
}

// Nút "Sửa icon" - chỉ hiện với chính chủ icon. Sửa trực tiếp trên tên/danh mục/
// thẻ/mã SVG (thay vì mở lại Builder), vì Builder không lưu đủ mọi tham số gốc
// (kiểu góc, xoay, lật, độ trong suốt...) nên không thể tái tạo chính xác 100%.
export default function EditIconButton({
  iconId,
  currentUserId,
  authorId,
  initialName,
  initialCategory,
  initialTags,
  initialSvgCode,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState(initialCategory);
  const [tagsInput, setTagsInput] = useState(initialTags.join(", "));
  const [svgCode, setSvgCode] = useState(initialSvgCode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryBoxRef.current &&
        !categoryBoxRef.current.contains(e.target as Node)
      ) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUserId || !authorId || currentUserId !== authorId) return null;

  const selectedCategoryLabel =
    categories.find((c) => c.id === category)?.label ?? category;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Tên icon không được để trống.");
      return;
    }
    if (!svgCode.trim().startsWith("<svg")) {
      setError("Mã SVG không hợp lệ - phải bắt đầu bằng thẻ <svg>.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/icons/${iconId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          tags: tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          svgCode: svgCode.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Không thể lưu thay đổi.");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-500 hover:border-jade-300 hover:text-jade-700 font-semibold text-sm transition-colors"
      >
        Sửa icon
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 animate-fade-in-up">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Sửa icon</h2>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Tên icon
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-jade-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Danh mục
                </label>
                <div ref={categoryBoxRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setCategoryOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 hover:border-jade-300 focus:outline-none focus:ring-2 focus:ring-jade-500 transition-colors"
                  >
                    <span>{selectedCategoryLabel}</span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        categoryOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {categoryOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-56 overflow-y-auto animate-fade-in-up">
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setCategory(c.id);
                            setCategoryOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            c.id === category
                              ? "bg-jade-50 text-jade-900 font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Thẻ (cách nhau bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="vd: mũi tên, điều hướng"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-jade-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Mã SVG
                </label>
                <div className="flex gap-3">
                  <div
                    className="w-16 h-16 shrink-0 rounded-lg border border-gray-200 flex items-center justify-center p-2 [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: svgCode }}
                  />
                  <textarea
                    value={svgCode}
                    onChange={(e) => setSvgCode(e.target.value)}
                    rows={6}
                    spellCheck={false}
                    className="flex-1 px-3 py-2 bg-gray-900 text-gray-200 font-mono text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-jade-500 resize-none"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="text-sm font-semibold text-white bg-jade-900 hover:bg-jade-700 disabled:opacity-50 px-5 py-2 rounded-full transition-colors"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
