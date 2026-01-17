import { getLinktreeWithLinksByUid } from "@/lib/supabase/queries";
import { notFound, redirect } from "next/navigation";
import dynamicImport from "next/dynamic";

// Dynamically import LinktreePage to reduce initial bundle size
const LinktreePage = dynamicImport(() => import("@/components/public/LinktreePage").then(mod => ({ default: mod.LinktreePage })), {
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  ),
  ssr: true,
});

// No caching - always fetch fresh data for accuracy
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ uid: string }>;
}

export default async function LinktreePublicPage({ params }: PageProps) {
  const { uid } = await params;
  
  // Redirect /ali to root since root page shows Ali Network linktree
  if (uid === "ali") {
    redirect("/");
  }
  
  // Optimized: Fetch linktree and links in a single database query
  const { linktree, links } = await getLinktreeWithLinksByUid(uid);
  
  if (!linktree) {
    notFound();
  }

  // View tracking is handled client-side via API route (unique views only)
  return <LinktreePage linktree={linktree} links={links} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { uid } = await params;
  
  // Redirect /ali to root in metadata as well
  if (uid === "ali") {
    return {
      title: "Ali Network",
      description: "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە",
    };
  }

  const { linktree } = await getLinktreeWithLinksByUid(uid);

  if (!linktree) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: linktree.name,
    description: linktree.subtitle || "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە",
    openGraph: {
      title: linktree.name,
      description: linktree.subtitle || "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە",
      images: linktree.image ? [linktree.image] : [],
    },
  };
}

