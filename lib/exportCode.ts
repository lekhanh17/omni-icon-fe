// Các hàm dùng chung để chuyển 1 đoạn code SVG hoàn chỉnh (dạng "<svg ...>...</svg>")
// sang các định dạng xuất khác: ảnh HTML (base64), component React, SFC Vue.
// Dùng cho cả trang chi tiết icon (/icon/[id]) và có thể tái sử dụng ở nơi khác.

const ATTR_TO_CAMEL: Record<string, string> = {
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-dasharray": "strokeDasharray",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
};

// Mã hoá base64 an toàn ở cả server (SSR, dùng Buffer) lẫn trình duyệt (dùng btoa)
export function toBase64(str: string): string {
  if (typeof window !== "undefined" && window.btoa) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  return Buffer.from(str, "utf-8").toString("base64");
}

// Chuyển 1 chuỗi bất kỳ thành PascalCase hợp lệ để đặt tên component
export function toPascalCase(str: string): string {
  const cleaned = str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim();
  if (!cleaned) return "MyIcon";
  const pascal = cleaned
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  return /^[0-9]/.test(pascal) ? `Icon${pascal}` : pascal;
}

// Thẻ <img> dùng base64 data URI - dán thẳng vào HTML tĩnh, không cần inline SVG
export function svgToHtmlImg(svgCode: string, size: number, alt: string): string {
  return `<img
  src="data:image/svg+xml;base64,${toBase64(svgCode)}"
  width="${size}"
  height="${size}"
  alt="${alt}"
/>`;
}

// Component React: chuyển thuộc tính kebab-case ở thẻ <svg> ngoài cùng sang camelCase,
// phần nội dung bên trong giữ nguyên qua dangerouslySetInnerHTML (an toàn vì chỉ chứa path/polygon...)
export function svgToReact(svgCode: string, componentName: string): string {
  const match = svgCode.match(/<svg([^>]*)>([\s\S]*)<\/svg>/i);
  if (!match) return svgCode;
  const [, rawAttrs, innerRaw] = match;
  const reactAttrs = rawAttrs.replace(
    /(stroke-width|stroke-linecap|stroke-linejoin|stroke-dasharray|fill-rule|clip-rule)=/g,
    (_m, p1: string) => `${ATTR_TO_CAMEL[p1]}=`
  );
  const inner = innerRaw.trim().replace(/`/g, "\\`");
  return `export default function ${componentName}(props) {
  return (
    <svg${reactAttrs}
      {...props}
    >
      <g dangerouslySetInnerHTML={{ __html: \`${inner}\` }} />
    </svg>
  );
}`;
}

// SFC Vue: template chấp nhận cú pháp HTML/SVG thuần nên không cần chuyển đổi thuộc tính
export function svgToVue(svgCode: string): string {
  const indented = svgCode
    .split("\n")
    .map((line) => "  " + line)
    .join("\n");
  return `<template>
${indented}
</template>

<script setup>
// Component tĩnh, không cần thêm logic
</script>`;
}
