import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error(
    "Vui lòng định nghĩa biến SESSION_SECRET trong file .env.local"
  );
}

export const SESSION_COOKIE_NAME = "omni_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 ngày

interface SessionPayload {
  userId: string;
  exp: number; // Unix timestamp (giây) hết hạn
}

function base64urlEncode(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64urlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(data: string) {
  return crypto
    .createHmac("sha256", SESSION_SECRET as string)
    .update(data)
    .digest("base64url");
}

// Tạo session token dạng "payload.chữ_ký" (tương tự JWT nhưng gọn nhẹ, không cần thêm thư viện)
export function createSessionToken(userId: string): string {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const payloadEncoded = base64urlEncode(JSON.stringify(payload));
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

// Xác thực + giải mã session token. Trả về userId nếu hợp lệ, null nếu không (sai chữ ký hoặc hết hạn)
export function verifySessionToken(
  token: string | undefined | null
): string | null {
  if (!token) return null;

  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) return null;

  const expectedSignature = sign(payloadEncoded);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  // So sánh bằng timingSafeEqual để tránh timing attack; phải kiểm tra độ dài trước
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(
      base64urlDecode(payloadEncoded)
    );
    if (payload.exp < Math.floor(Date.now() / 1000)) return null; // Hết hạn
    return payload.userId;
  } catch {
    return null;
  }
}
