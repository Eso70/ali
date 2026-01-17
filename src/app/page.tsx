import { getLinktreeWithLinksByUid } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import dynamicImport from "next/dynamic";

// Dynamically import LinktreePage to reduce initial bundle size
// Use ssr: true to enable server-side rendering for better SEO and initial load
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

export default async function Home() {
  // Get default Ali Network linktree (matches admin username)
  const linktreeUid = "ali";
  
  // Optimized: Fetch linktree and links in a single database query
  const { linktree, links } = await getLinktreeWithLinksByUid(linktreeUid);
  
  if (!linktree) {
    notFound();
  }

  // View tracking is handled client-side via API route (unique views only)
  return <LinktreePage linktree={linktree} links={links} />;
}

export async function generateMetadata() {
  const { linktree } = await getLinktreeWithLinksByUid("ali");

  if (!linktree) {
    return {
      title: "Ali Network",
      description: "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە",
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
