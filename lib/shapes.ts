export interface IconShape {
  id: string;
  name: string;
  // Markup bên trong thẻ <svg>, không kèm thẻ <svg> ngoài cùng
  markup: string;
}

export const shapes: IconShape[] = [
  {
    id: "star",
    name: "Ngôi sao",
    markup: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />`,
  },
  {
    id: "home",
    name: "Trang chủ",
    markup: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />`,
  },
  {
    id: "user",
    name: "Người dùng",
    markup: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />`,
  },
  {
    id: "heart",
    name: "Trái tim",
    markup: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />`,
  },
  {
    id: "search",
    name: "Tìm kiếm",
    markup: `<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />`,
  },
  {
    id: "shopping-cart",
    name: "Giỏ hàng",
    markup: `<circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />`,
  },
  {
    id: "arrow-right",
    name: "Mũi tên",
    markup: `<line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />`,
  },
  {
    id: "mail",
    name: "Thư",
    markup: `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />`,
  },
  {
    id: "bell",
    name: "Thông báo",
    markup: `<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />`,
  },
  {
    id: "check",
    name: "Xác nhận",
    markup: `<polyline points="20 6 9 17 4 12" />`,
  },
];