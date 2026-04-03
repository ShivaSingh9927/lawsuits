import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.SMTP_USER || process.env.EMAIL;
  const pass = process.env.SMTP_PASS || process.env.APP_PASSWORD;
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");

  if (!user || !pass) {
    console.error("❌ Email credentials missing in environment!");
    return null;
  }

  // Gmail-specific configuration is more reliable with these settings
  return nodemailer.createTransport(
    host 
      ? {
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        }
      : {
          service: "gmail",
          auth: { user, pass },
          tls: {
            rejectUnauthorized: false // Helps avoid local certificate issues
          }
        }
  );
}

export interface FittingEmailData {
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  date: string;
  timeSlot: string;
}

export async function sendFittingRequest(data: FittingEmailData) {
  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: "Configuration missing." };
  }

  const fromAddress = process.env.EMAIL || process.env.SMTP_USER || "thedressoutfitters@gmail.com";

  const mailOptionsTemplates = [
    {
      from: `"TDO Fitting Alert" <${fromAddress}>`,
      to: fromAddress, // Send to yourself/admin
      subject: `📅 NEW FITTING REQUEST - ${data.name}`,
      text: `New fitting request from ${data.name}. Phone: ${data.phone}. Date: ${data.date}.`,
      html: `<h2>New Fitting Inquiry</h2><p><strong>Name:</strong> ${data.name}</p><p><strong>Phone:</strong> ${data.phone}</p><p><strong>Date:</strong> ${data.date} (${data.timeSlot})</p>`
    },
    {
      from: `"The Dress Outfitters" <${fromAddress}>`,
      to: data.email, // Send to customer
      subject: `Fitting Request Received - The Dress Outfitters`,
      html: `<div style="font-family: serif; padding: 20px; border: 1px solid #ccc;">
               <h1>The Dress Outfitters</h1>
               <p>Dear ${data.name}, we have received your fitting request for <strong>${data.date}</strong>.</p>
               <p>Our team will contact you shortly at ${data.phone}.</p>
             </div>`
    }
  ];

  try {
    // Send emails sequentially or via Promise.all
    await transporter.sendMail(mailOptionsTemplates[0]);
    await transporter.sendMail(mailOptionsTemplates[1]);
    
    console.log("✅ Emails sent successfully");
    return { success: true };
  } catch (err: any) {
    console.error("❌ SMTP Error Debug Details:", {
      message: err.message,
      code: err.code,
      command: err.command,
      response: err.response
    });
    return { success: false, error: err.message || "Unknown SMTP error" };
  }
}
