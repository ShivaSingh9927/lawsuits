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
            rejectUnauthorized: false 
          }
        }
  );
}

// RESTORED: Required for the build to pass and for connection testing
export async function verifyMailConnection() {
  const transporter = getTransporter();
  if (!transporter) return { success: false, error: "Missing email credentials" };
  
  try {
    await transporter.verify();
    return { success: true };
  } catch (err: any) {
    console.error("SMTP Configuration Error:", err);
    return { success: false, error: err.message };
  }
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  items: Array<{
    product_name: string;
    variant_size: string;
    quantity: number;
    unit_price: number;
  }>;
  shippingAddress: string;
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

export interface InquiryEmailData {
  name: string;
  email: string;
  message: string;
}

export async function sendFittingRequest(data: FittingEmailData) {
  const transporter = getTransporter();
  if (!transporter) return { success: false, error: "Configuration missing." };

  const fromAddress = process.env.EMAIL || process.env.SMTP_USER || "thedressoutfitters@gmail.com";

  const mailOptionsTemplates = [
    {
      from: `"TDO Fitting Alert" <${fromAddress}>`,
      to: fromAddress,
      subject: `📅 NEW FITTING REQUEST - ${data.name.toUpperCase()}`,
      html: `<h2>New Fitting Inquiry</h2><p><strong>Name:</strong> ${data.name}</p><p><strong>Phone:</strong> ${data.phone}</p><p><strong>Date:</strong> ${data.date} (${data.timeSlot})</p>`
    },
    {
      from: `"The Dress Outfitters" <${fromAddress}>`,
      to: data.email,
      subject: `Fitting Request Received - The Dress Outfitters`,
      html: `<div style="font-family: serif; padding: 20px; border: 1px solid #ccc;"><h1>The Dress Outfitters</h1><p>Dear ${data.name}, we have received your fitting request for ${data.date}.</p></div>`
    }
  ];

  try {
    await transporter.sendMail(mailOptionsTemplates[0]);
    await transporter.sendMail(mailOptionsTemplates[1]);
    return { success: true };
  } catch (err: any) {
    console.error("❌ SMTP Error:", err);
    return { success: false, error: err.message };
  }
}

export async function sendOrderConfirmation(to: string, data: OrderEmailData) {
  const transporter = getTransporter();
  if (!transporter) return { success: false, error: "Configuration missing." };

  const fromAddress = process.env.EMAIL || process.env.SMTP_USER || "thedressoutfitters@gmail.com";

  const adminMailOptions = {
    from: `"Store Alert" <${fromAddress}>`,
    to: fromAddress,
    subject: `🔔 NEW ORDER - #${data.orderNumber}`,
    html: `<h2>New Order Received</h2><p>Customer: ${data.customerName}</p><p>Total: ₹${data.totalAmount}</p>`
  };

  const userMailOptions = {
    from: `"The Dress Outfitters" <${fromAddress}>`,
    to: to,
    subject: `Order Confirmed: #${data.orderNumber} - The Dress Outfitters`,
    html: `<h2>Confirmation of Order</h2><p>Dear ${data.customerName}, your order #${data.orderNumber} is confirmed.</p>`
  };

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);
    return { success: true };
  } catch (err: any) {
    console.error("Order Email Error:", err);
    return { success: false, error: err.message };
  }
}

export async function sendInquiryEmail(data: InquiryEmailData) {
  const transporter = getTransporter();
  if (!transporter) return { success: false, error: "Configuration missing." };

  const fromAddress = process.env.EMAIL || process.env.SMTP_USER || "thedressoutfitters@gmail.com";

  const adminMailOptions = {
    from: `"TDO Inquiry" <${fromAddress}>`,
    to: fromAddress,
    subject: `💬 NEW CONTACT INQUIRY - ${data.name.toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">New Contact Inquiry</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${data.message}</p>
      </div>
    `
  };

  const userMailOptions = {
    from: `"The Dress Outfitters" <${fromAddress}>`,
    to: data.email,
    subject: `Inquiry Received - The Dress Outfitters`,
    html: `
      <div style="font-family: serif; padding: 40px; text-align: center; border: 1px solid #eee;">
        <h1 style="font-size: 24px;">THE DRESS OUTFITTERS</h1>
        <p style="font-size: 16px; color: #666; margin-top: 20px;">Dear ${data.name},</p>
        <p style="font-size: 16px; color: #666;">Thank you for reaching out to us. We have received your inquiry and our concierge will contact you shortly.</p>
        <div style="margin-top: 40px; border-top: 1px solid #eee; pt-20">
          <p style="font-size: 12px; color: #999; letter-spacing: 2px;">ESTABLISHED EXCELLENCE</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);
    return { success: true };
  } catch (err: any) {
    console.error("❌ Inquiry Email Error:", err);
    return { success: false, error: err.message };
  }
}
