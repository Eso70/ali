import { query } from "@/lib/database/client";
import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (!sessionToken) {
    return null;
  }

  // Check if session is valid
  const isValidResult = await query<{ is_session_valid: boolean }>(
    "SELECT is_session_valid($1) as is_session_valid",
    [sessionToken]
  );

  if (!isValidResult.rows[0]?.is_session_valid) {
    return null;
  }

  // Get admin info by session
  const adminResult = await query<{ admin_id: string; username: string; name: string }>(
    "SELECT * FROM get_admin_by_session($1)",
    [sessionToken]
  );

  if (!adminResult.rows || adminResult.rows.length === 0) {
    return null;
  }

  const admin = adminResult.rows[0];

  // Ensure admin data exists
  if (!admin || !admin.admin_id) {
    return null;
  }

  return {
    user: {
      id: admin.admin_id,
      username: admin.username,
      name: admin.name,
    },
  };
}

