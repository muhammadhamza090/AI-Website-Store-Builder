import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * POST /api/auth/logout — Sign out the current user
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Logout failed" },
      { status: 500 }
    );
  }
}
