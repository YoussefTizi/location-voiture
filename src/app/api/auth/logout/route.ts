import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/server/auth";

export async function POST() {
  const cookie = clearAuthCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
