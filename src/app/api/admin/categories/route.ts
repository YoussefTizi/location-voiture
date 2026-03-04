import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminStateInitialized } from "@/lib/server/ensure-admin-state";

export async function GET() {
  try {
    await prisma.$transaction(async (tx) => {
      await ensureAdminStateInitialized(tx);
    });
    const categories = await prisma.carCategory.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json(categories.map((c) => ({ id: c.id, name: c.name })));
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load categories", detail: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const exists = await prisma.carCategory.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }

    const maxSort = await prisma.carCategory.aggregate({ _max: { sortOrder: true } });
    const created = await prisma.carCategory.create({
      data: { name, sortOrder: (maxSort._max.sortOrder ?? -1) + 1 },
    });
    return NextResponse.json({ id: created.id, name: created.name }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create category", detail: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}
