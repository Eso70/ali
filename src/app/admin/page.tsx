import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { getAllLinktrees, type Linktree } from "@/lib/supabase/queries";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic';

// Prevent caching of this page - always check authentication
export const revalidate = 0;

export default async function AdminPage() {
  // Check authentication FIRST - before any data fetching or rendering
  // This ensures no content is ever shown to unauthenticated users
  const session = await getSession();

  // Strict authentication check - redirect immediately if not logged in
  // This happens on the server before any HTML is sent to the client
  if (!session || !session.user || !session.user.id || !session.user.username) {
    redirect("/login");
  }

  // Only fetch data if authenticated
  // Fetch linktrees on server for instant display
  let initialLinktrees: Linktree[] = [];
  try {
    initialLinktrees = await getAllLinktrees(true); // Include analytics
    // Sort: ali (admin's linktree) always first, then others by created_at descending
    initialLinktrees.sort((a, b) => {
      if (a.uid === "ali") return -1;
      if (b.uid === "ali") return 1;
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching initial linktrees:", error);
    // Continue with empty array - client will refetch
  }

  // Double-check session exists before rendering (defensive programming)
  if (!session || !session.user) {
    redirect("/login");
  }

  return <AdminDashboard initialLinktrees={initialLinktrees} currentUsername={session.user.username} />;
}

