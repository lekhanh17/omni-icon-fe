import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectToDatabase } from "../../lib/db";
import Collection from "../../models/Collection";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../lib/auth";
import CollectionsClient from "./CollectionsClient";

// Danh sách bộ sưu tập icon cá nhân - bắt buộc đăng nhập
export default async function CollectionsPage() {
  const cookieStore = await cookies();
  const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!userId) {
    redirect("/login");
  }

  await connectToDatabase();
  const collections = await Collection.find({ ownerId: userId }).sort({
    createdAt: -1,
  });

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16 bg-gray-50 w-full">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-extrabold text-jade-900 mb-3">
          Bộ sưu tập
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          Gom nhóm các icon bạn thích thành từng bộ sưu tập riêng, tiện dùng
          theo từng dự án.
        </p>

        <CollectionsClient
          initialCollections={JSON.parse(JSON.stringify(collections))}
        />
      </div>
    </main>
  );
}
