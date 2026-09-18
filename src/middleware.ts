import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;
  const isAuthPage = pathname.startsWith("/auth");

  // If user is authenticated and tries to access /auth
  if (token && isAuthPage) {
    const groupID = request.nextUrl.searchParams.get("groupID");
    if (groupID) {
      return NextResponse.redirect(new URL(`/?groupID=${groupID}`, request.url));
    }
    const redirectUrl = request.nextUrl.searchParams.get("redirectUrl");
    if (redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is NOT authenticated and tries to access protected pages
  if (!token && !isAuthPage) {
    const groupID = request.nextUrl.searchParams.get("groupID");
    const authUrl = new URL("/auth", request.url);

    if (groupID) {
      authUrl.searchParams.set("groupID", groupID);
    } else if (pathname !== "/") {
      authUrl.searchParams.set("redirectUrl", `${pathname}${search}`);
    }

    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes if any)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
