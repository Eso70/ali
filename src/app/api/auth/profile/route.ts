import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { query } from "@/lib/database/client";
import { z } from "zod";

const updateUsernameSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must be at most 50 characters"),
  currentPassword: z.string().min(1, "Current password is required"),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// PATCH /api/auth/profile - Update username or password (admin only)
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Verify current password first
    const passwordResult = await query<{ verify_admin_password: boolean }>(
      "SELECT verify_admin_password($1, $2) as verify_admin_password",
      [session.user.username, body.currentPassword]
    );

    if (!passwordResult.rows[0]?.verify_admin_password) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Update username
    if (body.username) {
      const validationResult = updateUsernameSchema.safeParse({
        username: body.username,
        currentPassword: body.currentPassword,
      });

      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: "Validation failed",
            details: validationResult.error.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }

      // Check if username already exists
      const existingAdminResult = await query<{ id: string }>(
        "SELECT id FROM admins WHERE username = $1 AND id != $2",
        [body.username, session.user.id]
      );

      if (existingAdminResult.rows && existingAdminResult.rows.length > 0) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 }
        );
      }

      // Update username
      await query(
        "UPDATE admins SET username = $1, updated_at = NOW() WHERE id = $2",
        [body.username, session.user.id]
      );

      return NextResponse.json({
        message: "Username updated successfully",
        user: {
          id: session.user.id,
          username: body.username,
          name: session.user.name,
        },
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // Update password
    if (body.newPassword) {
      const validationResult = updatePasswordSchema.safeParse({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
        confirmPassword: body.confirmPassword,
      });

      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: "Validation failed",
            details: validationResult.error.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }

      // Update password using database function
      await query("SELECT update_admin_password($1, $2)", [
        session.user.id,
        body.newPassword,
      ]);

      return NextResponse.json({
        message: "Password updated successfully",
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    return NextResponse.json(
      { error: "No update specified" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

