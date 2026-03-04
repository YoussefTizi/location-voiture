import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function GET() {
  const cars = await prisma.car.findMany({ include: { images: { orderBy: { sortOrder: "asc" } } }, orderBy: { id: "asc" } });
  return NextResponse.json(
    cars.map((car) => ({
      id: car.id,
      name: car.name,
      category: car.category,
      price_per_day: car.pricePerDay,
      images: car.images.map((img) => img.url),
      transmission: car.transmission,
      fuel_type: car.fuelType,
      seats: car.seats,
      availability_status: car.availabilityStatus,
      featured: car.featured,
      description: car.description,
    })),
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = `car-${randomUUID()}`;
    const name = String(body.name ?? "").trim();
    const category = String(body.category ?? "").trim();
    const description = String(body.description ?? "").trim();
    const pricePerDay = Number(body.price_per_day ?? 0);
    const seats = Number(body.seats ?? 0);
    const transmission = body.transmission === "manual" ? "manual" : "automatic";
    const fuelType = ["petrol", "diesel", "electric", "hybrid"].includes(String(body.fuel_type))
      ? String(body.fuel_type)
      : "petrol";
    const availabilityStatus = ["available", "rented", "maintenance"].includes(String(body.availability_status))
      ? String(body.availability_status)
      : "available";
    const rawImages: unknown[] = Array.isArray(body.images) ? body.images : [];
    const images = rawImages
      .map((v) => String(v ?? "").trim())
      .filter(Boolean);

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: "category is required" }, { status: 400 });
    }
    if (!Number.isFinite(pricePerDay) || pricePerDay < 0) {
      return NextResponse.json({ error: "price_per_day must be a valid number >= 0" }, { status: 400 });
    }
    if (!Number.isFinite(seats) || seats < 1) {
      return NextResponse.json({ error: "seats must be a valid number >= 1" }, { status: 400 });
    }

    const car = await prisma.$transaction(async (tx) => {
      const existingCategory = await tx.carCategory.findFirst({
        where: { name: { equals: category, mode: "insensitive" } },
        select: { id: true, name: true },
      });
      const finalCategoryName = existingCategory?.name ?? category;
      if (!existingCategory) {
        const maxSort = await tx.carCategory.aggregate({ _max: { sortOrder: true } });
        await tx.carCategory.create({
          data: {
            name: finalCategoryName,
            sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
          },
        });
      }

      return tx.car.create({
        data: {
          id,
          name,
          category: finalCategoryName,
          pricePerDay,
          transmission,
          fuelType: fuelType as "petrol" | "diesel" | "electric" | "hybrid",
          seats,
          availabilityStatus: availabilityStatus as "available" | "rented" | "maintenance",
          featured: Boolean(body.featured),
          description,
          images: {
            create: images.map((url, index) => ({ url, sortOrder: index })),
          },
        },
        include: { images: { orderBy: { sortOrder: "asc" } } },
      });
    });

    return NextResponse.json(
      {
        id: car.id,
        name: car.name,
        category: car.category,
        price_per_day: car.pricePerDay,
        images: car.images.map((img) => img.url),
        transmission: car.transmission,
        fuel_type: car.fuelType,
        seats: car.seats,
        availability_status: car.availabilityStatus,
        featured: car.featured,
        description: car.description,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create car", detail: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}
