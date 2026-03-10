import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CreateBookingBody = {
  customer_name?: string;
  phone?: string;
  email?: string;
  pickup_date?: string;
  return_date?: string;
  car_id?: string;
};

const toIsoDate = (value: string) => value.slice(0, 10);

const buildBookingId = async () => {
  for (let i = 0; i < 6; i += 1) {
    const candidate = `BK-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
    const existing = await prisma.booking.findUnique({ where: { id: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  return `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateBookingBody;

    const carId = (body.car_id || "").trim();
    if (!carId) {
      return NextResponse.json({ error: "car_id is required" }, { status: 400 });
    }

    const customerName = (body.customer_name || "").trim();
    const phone = (body.phone || "").trim();
    const email = (body.email || "").trim();
    const pickupRaw = (body.pickup_date || "").trim();
    const returnRaw = (body.return_date || "").trim();

    if (!pickupRaw || !returnRaw) {
      return NextResponse.json({ error: "pickup_date and return_date are required" }, { status: 400 });
    }

    const pickupDate = new Date(pickupRaw);
    const returnDate = new Date(returnRaw);
    if (Number.isNaN(pickupDate.getTime()) || Number.isNaN(returnDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }
    if (returnDate.getTime() < pickupDate.getTime()) {
      return NextResponse.json({ error: "return_date must be greater than or equal to pickup_date" }, { status: 400 });
    }

    const car = await prisma.car.findUnique({ where: { id: carId }, select: { id: true, pricePerDay: true } });
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    const bookingDays = Math.max(1, Math.ceil((returnDate.getTime() - pickupDate.getTime()) / 86400000));
    const pricePerDaySnapshot = car.pricePerDay;
    const totalAmountSnapshot = pricePerDaySnapshot * bookingDays;
    const currencyCode = "MAD";

    const bookingId = await buildBookingId();
    const booking = await prisma.booking.create({
      data: {
        id: bookingId,
        customerName,
        phone,
        email,
        pickupDate,
        returnDate,
        carId,
        status: "pending",
        pricePerDaySnapshot,
        totalAmountSnapshot,
        currencyCode,
      },
    });

    return NextResponse.json({
      booking_id: booking.id,
      customer_name: booking.customerName,
      phone: booking.phone,
      email: booking.email,
      created_at: booking.createdAt.toISOString(),
      pickup_date: toIsoDate(booking.pickupDate.toISOString()),
      return_date: toIsoDate(booking.returnDate.toISOString()),
      car_id: booking.carId,
      status: booking.status,
      price_per_day_snapshot: booking.pricePerDaySnapshot,
      total_amount_snapshot: booking.totalAmountSnapshot,
      currency_code: booking.currencyCode,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create booking", detail: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}
