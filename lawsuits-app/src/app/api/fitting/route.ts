import { NextResponse } from "next/server";
import { sendFittingRequest } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, address, category, date, timeSlot } = body;

    // Basic validation
    if (!name || !email || !phone || !category || !date) {
      return NextResponse.json(
        { error: "Please provide all required details." },
        { status: 400 }
      );
    }

    const result = await sendFittingRequest({
      name,
      email,
      phone,
      address,
      category,
      date,
      timeSlot,
    });

    if (result.success) {
      return NextResponse.json({ message: "Fitting request sent successfully" });
    } else {
      return NextResponse.json(
        { error: "Failed to send fitting request. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Fitting API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
