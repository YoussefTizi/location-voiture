import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = String(body.name);
  if (body.category !== undefined) data.category = String(body.category);
  if (body.price_per_day !== undefined) data.pricePerDay = Number(body.price_per_day);
  if (body.transmission !== undefined) data.transmission = body.transmission;
  if (body.fuel_type !== undefined) data.fuelType = body.fuel_type;
  if (body.seats !== undefined) data.seats = Number(body.seats);
  if (body.availability_status !== undefined) data.availabilityStatus = body.availability_status;
  if (body.featured !== undefined) data.featured = Boolean(body.featured);
  if (body.description !== undefined) data.description = String(body.description);

  await prisma.$transaction(async (tx) => {
    if (Object.keys(data).length > 0) {
      await tx.car.update({ where: { id }, data });
    }

    if (Array.isArray(body.images)) {
      await tx.carImage.deleteMany({ where: { carId: id } });
      if (body.images.length > 0) {
        await tx.carImage.createMany({
          data: body.images.map((url: string, index: number) => ({ carId: id, url, sortOrder: index })),
        });
      }
    }
  });

  const car = await prisma.car.findUniqueOrThrow({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } });

  return NextResponse.json({
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
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.car.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
