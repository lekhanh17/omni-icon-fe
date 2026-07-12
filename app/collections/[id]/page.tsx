import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { connectToDatabase } from "../../../lib/db";
import Collection from "../../../models/Collection";
import Icon from "../../../models/Icon";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../lib/auth";
import CollectionDetailClient from "./CollectionDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Xem chi tiết 1 bộ sưu tập - chỉ chủ sở hữu mới xem được
export default async function CollectionDetailPage({ params }: PageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!userId) {
    redirect("/login");
  }

  await connectToDatabase();

  let collection = null;
  try {
    collection = await Collection.findById(id);
  } catch {
    collection = null;
  }

  if (!collection || collection.ownerId.toString() !== userId) {
    notFound();
  }

  const icons = await Icon.find({ _id: { $in: collection.iconIds } });

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16 bg-gray-50 w-full">
      <div className="w-full max-w-6xl">
        <Link
          href="/collections"
          className="text-sm font-semibold text-gray-500 hover:text-jade-700 transition-colors"
        >
          ← Tất cả bộ sưu tập
        </Link>

        <CollectionDetailClient
          collectionId={String(collection._id)}
          initialName={collection.name}
          icons={JSON.parse(JSON.stringify(icons))}
        />
      </div>
    </main>
  );
}
