import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy — runs on every request (Next.js 16 convention, replaces middleware).
 * - Refreshes Supabase auth session (keeps cookies alive)
 * - Protects /cms/*, /orgs/*, /generate/*, /dashboard/* routes
 * - Allows public access to /s/* (live sites), /login, /signup
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — IMPORTANT: must be called to keep auth alive
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes — no auth required
  const isPublic =
    pathname === "/" ||                         // Landing page
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/s/") ||              // Live websites
    pathname.startsWith("/api/") ||            // All API routes (they handle own auth)
    pathname.startsWith("/_next") ||            // Next.js internals
    pathname.startsWith("/favicon") ||
    pathname === "/service-worker.js";

  // If logged in and visiting /login or /signup → redirect to /orgs
  // (/ landing page is always accessible — it has its own logged-in state)
  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/orgs", request.url));
  }

  if (isPublic) {
    return response;
  }

  // Everything else is protected — redirect to login if not authenticated
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    // Don't set redirect for "/" — just go to login
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - Public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
