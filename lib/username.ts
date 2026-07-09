import User from "../models/User";

// Chuyển 1 chuỗi bất kỳ (thường là phần đầu email, vốn đã là ký tự ASCII) thành
// username hợp lệ: chỉ gồm chữ thường, số, dấu gạch dưới
function slugify(input: string): string {
  const cleaned = input
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "")
    .slice(0, 20);
  return cleaned || "user";
}

// Sinh username duy nhất trong DB dựa trên 1 chuỗi gợi ý (thường là phần đầu email)
export async function generateUniqueUsername(base: string): Promise<string> {
  const slug = slugify(base);
  let candidate = slug;
  let suffix = 0;

  // Thử tối đa 50 lần trước khi fallback sang hậu tố thời gian, tránh lặp vô hạn
  while (suffix < 50) {
    const exists = await User.findOne({ username: candidate });
    if (!exists) return candidate;
    suffix += 1;
    candidate = `${slug}${suffix}`;
  }

  return `${slug}${Date.now().toString().slice(-6)}`;
}
