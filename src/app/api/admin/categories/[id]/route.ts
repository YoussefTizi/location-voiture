import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const name = String(body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const current = await prisma.carCategory.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const duplicate = await prisma.carCategory.findFirst({
      where: { id: { not: id }, name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.car.updateMany({
        where: { category: current.name },
        data: { category: name },
      });
      return tx.carCategory.update({
        where: { id },
        data: { name },
      });
    });

    return NextResponse.json({ id: updated.id, name: updated.name });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update category", detail: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const category = await prisma.carCategory.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const linkedCars = await prisma.car.count({ where: { category: category.name } });
    if (linkedCars > 0) {
      return NextResponse.json(
        { error: "Cannot delete category used by vehicles", detail: `Linked vehicles: ${linkedCars}` },
        { status: 409 },
      );
    }

    await prisma.carCategory.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete category", detail: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}
