interface Props {
  basePath: string;
  from?: string;
  to?: string;
}

// Bộ lọc theo khoảng ngày, dùng chung cho trang Icon và Bình luận trong khu quản trị.
// Dùng form GET thuần (không cần "use client") - tải lại trang với query ?from=&to=
export default function AdminDateFilter({ basePath, from, to }: Props) {
  const hasFilter = !!from || !!to;

  // Ngày hôm nay (giờ local server) - dùng làm giới hạn max, không cho chọn ngày chưa tới
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <form
      action={basePath}
      method="GET"
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap items-end gap-4"
    >
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Từ ngày
        </label>
        <input
          type="date"
          name="from"
          defaultValue={from}
          max={maxDate}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Đến ngày
        </label>
        <input
          type="date"
          name="to"
          defaultValue={to}
          max={maxDate}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
        />
      </div>
      <button
        type="submit"
        className="text-sm bg-jade-900 hover:bg-jade-700 text-white px-5 py-2 rounded-full font-semibold transition-colors"
      >
        Lọc
      </button>
      {hasFilter && (
        <a
          href={basePath}
          className="text-sm font-semibold text-gray-500 hover:text-jade-700 transition-colors"
        >
          Xoá lọc
        </a>
      )}
    </form>
  );
}
