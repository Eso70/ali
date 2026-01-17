import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { flushAllQueues } from "@/lib/utils/batch-queue";

// POST /api/linktrees/[id]/analytics/flush - Flush server-side batch queues
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Invalid linktree ID format" },
        { status: 400 }
      );
    }
    
    // Flush all server-side batch queues
    // This will wait for all database inserts to complete
    try {
      await flushAllQueues();
    } catch (flushError) {
      // Log detailed error information
      const errorMessage = flushError instanceof Error 
        ? flushError.message 
        : String(flushError);
      const errorDetails = flushError instanceof Error && 'code' in flushError
        ? `Code: ${String(flushError.code)}`
        : '';
      
      console.error("Error flushing queues:", {
        message: errorMessage,
        details: errorDetails,
        error: flushError,
      });
      
      // Return a more informative error response
      return NextResponse.json(
        { 
          error: "Failed to flush queues",
          message: errorMessage,
          details: errorDetails,
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "Queues flushed successfully",
      success: true,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    // Catch any unexpected errors
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error);
    
    console.error("Unexpected error in flush endpoint:", {
      message: errorMessage,
      error,
    });
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
