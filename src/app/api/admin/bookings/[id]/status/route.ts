import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const booking = await prisma.booking.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json({
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
}
