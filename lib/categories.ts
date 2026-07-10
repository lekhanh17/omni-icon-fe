export interface IconCategory {
  id: string;
  label: string;
}

// Danh mục dùng chung giữa Builder (khi lưu icon) và Explore (khi lọc)
export const categories: IconCategory[] = [
  { id: "general", label: "Chung" },
  { id: "ui", label: "Giao diện" },
  { id: "commerce", label: "Thương mại" },
  { id: "communication", label: "Truyền thông" },
  { id: "other", label: "Khác" },
];
