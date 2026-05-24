import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/profile",
  "/elonlarim",
  "/listings/new",
  "/requests",
  "/chats",
  "/favorites",
  "/ads",
  "/reklama",
  "/help",
  "/adminpanel",
  "/settings",
];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const fullPath = pathname + search;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", fullPath);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Admin panel uses separate auth cookie
  if (pathname === "/adminpanel" || pathname.startsWith("/adminpanel/")) {
    const hasAdmin = Boolean(req.cookies.get("annikah_admin")?.value);
    if (!hasAdmin && pathname !== "/adminpanel/login") {
      const url = req.nextUrl.clone();
      url.pathname = "/adminpanel/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const hasSession = Boolean(req.cookies.get("annikah_session")?.value);
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", fullPath);
    url.searchParams.set("required", "1");
    return NextResponse.redirect(url);
  }
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/elonlarim/:path*",
    "/listings/new",
    "/requests/:path*",
    "/chats/:path*",
    "/favorites/:path*",
    "/ads",
    "/ads/:path*",
    "/reklama",
    "/reklama/:path*",
    "/help/:path*",
    "/adminpanel/:path*",
    "/settings/:path*",
  ],
};

