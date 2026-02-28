import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, getAuthCookie } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = String(body.username ?? "");
    const password = String(body.password ?? "");

    const user = await prisma.adminUser.findUnique({ where: { username } });
    if (!user || !user.isActive || user.passwordHash !== password) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }

    const token = createSessionToken(user.username);
    const cookie = getAuthCookie(token);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(cookie.name, cookie.value, cookie.options);
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Login failed" }, { status: 500 });
  }
}
