import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../lib/auth";

// Bọc /builder: bắt buộc đăng nhập mới được vào tạo/vẽ icon, chưa đăng nhập thì đưa sang /login
export default async function BuilderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!userId) {
    redirect("/login");
  }

  return <>{children}</>;
}
