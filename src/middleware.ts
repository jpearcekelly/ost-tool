import { NextRequest, NextResponse } from "next/server";

const SITE_PASSWORD = process.env.SITE_PASSWORD;
const COOKIE_NAME = "ost-auth";

export function middleware(request: NextRequest) {
  // No password set — skip auth entirely (local dev, or if not configured)
  if (!SITE_PASSWORD) {
    return NextResponse.next();
  }

  // Already authenticated
  if (request.cookies.get(COOKIE_NAME)?.value === SITE_PASSWORD) {
    return NextResponse.next();
  }

  // Handle login form submission
  if (request.method === "POST" && request.nextUrl.pathname === "/login") {
    return handleLogin(request);
  }

  // Show login page for all other unauthenticated requests
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next();
  }

  // Redirect to login
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

async function handleLogin(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get("password");

  if (password === SITE_PASSWORD) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(COOKIE_NAME, SITE_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }

  // Wrong password — redirect back to login with error
  const loginUrl = new URL("/login?error=1", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
