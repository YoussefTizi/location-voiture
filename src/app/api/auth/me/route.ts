import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  if (!session.valid || !session.username) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await prisma.adminUser.findUnique({ where: { username: session.username } });
  if (!user || !user.isActive) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, username: user.username });
}
