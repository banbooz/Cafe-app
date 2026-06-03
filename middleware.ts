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
  const username = process.env.KITCHEN_USERNAME;
  const password = process.env.KITCHEN_PASSWORD;

  if (!username || !password) {
    return new NextResponse("Kitchen access is not configured", { status: 503 });
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Basic ")) {
    return unauthorized();
  }

  const encoded = authHeader.split(" ")[1];
  const decoded = atob(encoded);
  const [givenUsername, givenPassword] = decoded.split(":");

  if (givenUsername !== username || givenPassword !== password) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/kitchen/:path*"],
};
