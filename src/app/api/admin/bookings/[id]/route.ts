import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const mapBooking = (booking: {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  pickupDate: Date;
  returnDate: Date;
  createdAt: Date;
  carId: string;
  status: string;
  pricePerDaySnapshot: number;
  totalAmountSnapshot: number;
  currencyCode: string;
}) => ({
  booking_id: booking.id,
  customer_name: booking.customerName,
  phone: booking.phone,
  email: booking.email,
  created_at: booking.createdAt.toISOString(),
  pickup_date: booking.pickupDate.toISOString().slice(0, 10),
  return_date: booking.returnDate.toISOString().slice(0, 10),
  car_id: booking.carId,
  status: booking.status,
  price_per_day_snapshot: booking.pricePerDaySnapshot,
  total_amount_snapshot: booking.totalAmountSnapshot,
  currency_code: booking.currencyCode,
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (typeof body.customer_name === "string") data.customerName = body.customer_name.trim();
    if (typeof body.phone === "string") data.phone = body.phone.trim();
    if (typeof body.email === "string") data.email = body.email.trim();
    if (typeof body.status === "string") data.status = body.status;
    if (typeof body.car_id === "string") data.carId = body.car_id;

    if (typeof body.pickup_date === "string" && body.pickup_date.trim()) {
      const d = new Date(body.pickup_date);
      if (Number.isNaN(d.getTime())) return NextResponse.json({ error: "Invalid pickup_date" }, { status: 400 });
      data.pickupDate = d;
    }
    if (typeof body.return_date === "string" && body.return_date.trim()) {
      const d = new Date(body.return_date);
      if (Number.isNaN(d.getTime())) return NextResponse.json({ error: "Invalid return_date" }, { status: 400 });
      data.returnDate = d;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
    }

    const existing = await prisma.booking.findUnique({
      where: { id },
      select: {
        pickupDate: true,
        returnDate: true,
        carId: true,
        pricePerDaySnapshot: true,
        currencyCode: true,
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const nextPickupDate = (data.pickupDate as Date | undefined) ?? existing.pickupDate;
    const nextReturnDate = (data.returnDate as Date | undefined) ?? existing.returnDate;
    const nextCarId = (data.carId as string | undefined) ?? existing.carId;

    if (nextReturnDate.getTime() < nextPickupDate.getTime()) {
      return NextResponse.json({ error: "return_date must be greater than or equal to pickup_date" }, { status: 400 });
    }

    let nextPricePerDaySnapshot = existing.pricePerDaySnapshot;
    if (nextCarId !== existing.carId) {
      const nextCar = await prisma.car.findUnique({ where: { id: nextCarId }, select: { pricePerDay: true } });
      if (!nextCar) {
        return NextResponse.json({ error: "Car not found" }, { status: 404 });
      }
      nextPricePerDaySnapshot = nextCar.pricePerDay;
      data.pricePerDaySnapshot = nextPricePerDaySnapshot;
    }

    const nextDays = Math.max(1, Math.ceil((nextReturnDate.getTime() - nextPickupDate.getTime()) / 86400000));
    data.totalAmountSnapshot = nextPricePerDaySnapshot * nextDays;
    data.currencyCode = existing.currencyCode;

    const booking = await prisma.booking.update({
      where: { id },
      data,
    });

    return NextResponse.json(mapBooking(booking));
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update booking", detail: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete booking", detail: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}
