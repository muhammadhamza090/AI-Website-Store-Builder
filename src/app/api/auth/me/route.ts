import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * GET /api/auth/me — Get current authenticated user info
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null, authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name ?? null,
        createdAt: user.created_at,
      },
      authenticated: true,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Auth error", authenticated: false },
      { status: 500 }
    );
  }
}
