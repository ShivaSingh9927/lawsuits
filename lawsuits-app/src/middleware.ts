import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
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
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protect /account routes
    if (request.nextUrl.pathname.startsWith("/account") && !user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("returnTo", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Protect /admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!user) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("returnTo", request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Protect /checkout route
    if (request.nextUrl.pathname === "/checkout" && !user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("returnTo", "/checkout");
      return NextResponse.redirect(redirectUrl);
    }
  } catch (err) {
    console.error("Middleware auth error:", err);
    // If it's a timeout or network error, we might want to let it pass and let the client-side handle it
    // or show an error. For now, we continue to prevent infinite redirect loops if Supabase is down.
  }

  return response;
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/checkout"],
};
