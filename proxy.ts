import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, isValidAuthCookie } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo";

export async function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (isDemoMode()) {
    if (isLoginPage) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const valid = await isValidAuthCookie(cookie);

  if (!valid && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (valid && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
