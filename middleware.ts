import { NextResponse, type NextRequest } from "next/server";

function unauthorized() {
  return new NextResponse("Kitchen login required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Cafe Kitchen", charset="UTF-8"',
    },
  });
}

export function middleware(request: NextRequest) {
  const username = process.env.KITCHEN_USERNAME?.trim();
  const password = process.env.KITCHEN_PASSWORD?.trim();

  if (!username || !password) {
    return new NextResponse("Kitchen access is not configured", { status: 503 });
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Basic ")) {
    return unauthorized();
  }

  try {
    const encoded = authHeader.slice(6);
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return unauthorized();
    }

    const givenUsername = decoded.slice(0, separatorIndex).trim();
    const givenPassword = decoded.slice(separatorIndex + 1).trim();

    if (givenUsername !== username || givenPassword !== password) {
      return unauthorized();
    }

    return NextResponse.next();
  } catch {
    return unauthorized();
  }
}

export const config = {
  matcher: ["/kitchen/:path*"],
};
