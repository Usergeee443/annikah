import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "annikah_session";

function sessionSecret() {
  return process.env.AUTH_SESSION_SECRET || "dev-secret-change-me";
}

async function sha256hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function isSessionCookieValid(signed: string) {
  const dot = signed.indexOf(".");
  if (dot <= 0) return false;
  const token = signed.slice(0, dot);
  const mac = signed.slice(dot + 1);
  const expected = await sha256hex(`${token}:${sessionSecret()}`);
  return expected === mac;
}

function loginRedirect(req: NextRequest, fullPath: string, clearCookie: boolean) {
  const url = req.nextUrl.clone();
  url.pathname = "/auth/login";
  url.search = "";
  url.searchParams.set("next", fullPath);
  url.searchParams.set("required", "1");
  const res = NextResponse.redirect(url);
  if (clearCookie) {
    res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  }
  return res;
}

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

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const fullPath = pathname + search;

  if (process.env.NODE_ENV === "development" && req.nextUrl.hostname === "localhost") {
    const url = req.nextUrl.clone();
    url.hostname = "127.0.0.1";
    return NextResponse.redirect(url);
  }

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

  const signed = req.cookies.get(SESSION_COOKIE)?.value;
  if (!signed) {
    return loginRedirect(req, fullPath, false);
  }
  if (!(await isSessionCookieValid(signed))) {
    return loginRedirect(req, fullPath, true);
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

