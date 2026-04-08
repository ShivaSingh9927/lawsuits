import { NextResponse } from "next/server";
import { sendInquiryEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Please provide all required fields (Name, Email, Message)." },
        { status: 400 }
      );
    }

    const result = await sendInquiryEmail({
      name,
      email,
      message,
    });

    if (result.success) {
      console.log(`✅ Contact inquiry sent successfully from ${email}`);
      return NextResponse.json({ 
        message: "Inquiry sent successfully",
        status: 200 
      });
    } else {
      console.error("❌ Failed to send contact inquiry:", result.error);
      return NextResponse.json(
        { 
          error: "Failed to send inquiry. Please try again later.",
          details: result.error,
          status: 500 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("💥 Contact API Uncaught Error:", error);
    return NextResponse.json(
      { 
        error: "An unexpected error occurred.", 
        details: error.message || String(error),
        status: 500 
      },
      { status: 500 }
    );
  }
}
