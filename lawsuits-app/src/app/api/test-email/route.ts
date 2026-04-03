import { NextResponse } from "next/server";
import { verifyMailConnection } from "@/lib/mail";

export async function GET() {
  const result = await verifyMailConnection();
  
  return NextResponse.json({
    status: result.success ? "connected" : "failed",
    error: result.error,
    environment: {
      EMAIL: process.env.EMAIL ? "SET" : "NOT SET",
      APP_PASSWORD: process.env.APP_PASSWORD ? "SET" : "NOT SET",
      SMTP_HOST: process.env.SMTP_HOST ? "SET" : "NOT SET",
      SMTP_USER: process.env.SMTP_USER ? "SET" : "NOT SET",
      SMTP_PASS: process.env.SMTP_PASS ? "SET" : "NOT SET",
    },
    message: result.success 
      ? "SMTP connection verified successfully. Your configuration is correct."
      : "SMTP connection failed. Please check your environment variables and Gmail App Password."
  });
}
