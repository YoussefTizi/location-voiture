import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const body = await req.json();
  const id = String(body.id ?? `car-${Date.now()}`);
  const images: string[] = Array.isArray(body.images) ? body.images : [];

  const car = await prisma.car.create({
    data: {
      id,
      name: String(body.name ?? ""),
      category: String(body.category ?? ""),
      pricePerDay: Number(body.price_per_day ?? 0),
      transmission: body.transmission,
      fuelType: body.fuel_type,
      seats: Number(body.seats ?? 0),
      availabilityStatus: body.availability_status,
      featured: Boolean(body.featured),
      description: String(body.description ?? ""),
      images: {
        create: images.map((url, index) => ({ url, sortOrder: index })),
      },
    },
    include: { images: { orderBy: { sortOrder: "asc" } } },
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
}
