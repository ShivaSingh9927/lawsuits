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
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee;">
          <h2 style="border-bottom: 2px solid #D4AF37; padding-bottom: 10px; color: #000;">New Fitting Inquiry</h2>
          <p><strong>Counsel Name:</strong> ${data.name}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Address:</strong> ${data.address || "Not Provided"}</p>
          <p><strong>Preferred Schedule:</strong> ${data.date} (${data.timeSlot})</p>
          <div style="margin-top: 20px; padding: 15px; background: #fdfcfb; border-left: 4px solid #D4AF37;">
            <p style="margin-top: 0; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Requested Products & Sizes:</p>
            <p style="margin-bottom: 0;">${data.category}</p>
          </div>
        </div>
      `
    },
    {
      from: `"The Dress Outfitters" <${fromAddress}>`,
      to: data.email,
      subject: `Fitting Request Received - The Dress Outfitters`,
      html: `
        <div style="font-family: serif; padding: 40px; text-align: center; border: 1px solid #eee; max-width: 600px; margin: 0 auto;">
          <h1 style="font-size: 24px; letter-spacing: 4px; color: #000;">THE DRESS OUTFITTERS</h1>
          <div style="margin: 30px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 20px 0;">
            <p style="font-size: 18px; font-style: italic; color: #333;">Dear ${data.name},</p>
            <p style="font-size: 15px; color: #666; line-height: 1.6;">
              We have received your request for an in-home trial session on <strong>${data.date}</strong> during the <strong>${data.timeSlot}</strong> window.
            </p>
            <p style="font-size: 14px; color: #888; margin-top: 10px;">
              Our Master Tailor will reach out to you shortly at ${data.phone} to finalize the logistics.
            </p>
          </div>
          <div style="text-align: left; padding: 20px; background: #fafafa;">
            <p style="font-[sans-serif]; font-size: 10px; uppercase; tracking: 2px; color: #999; margin-bottom: 10px;">YOUR SELECTION:</p>
            <p style="font-size: 13px; color: #444;">${data.category}</p>
          </div>
          <div style="margin-top: 40px;">
            <p style="font-size: 11px; color: #bbb; letter-spacing: 3px; text-transform: uppercase;">Established Excellence</p>
          </div>
        </div>
      `
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
    from: `"TDO Store Alert" <${fromAddress}>`,
    to: fromAddress,
    subject: `🔔 NEW ORDER RECEIVED - #${data.orderNumber}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee;">
        <h2 style="border-bottom: 2px solid #000; padding-bottom: 10px; color: #000;">Management Alert: New Order</h2>
        <p><strong>Order Number:</strong> #${data.orderNumber}</p>
        <p><strong>Customer:</strong> ${data.customerName}</p>
        <p><strong>Total Amount:</strong> ₹${data.totalAmount.toLocaleString()}</p>
        <p><strong>Destination:</strong> ${data.shippingAddress}</p>
        <div style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase;">View in Dashboard</a>
        </div>
      </div>
    `
  };

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0;">
        <div style="font-size: 14px; font-weight: bold; color: #000; text-transform: uppercase; letter-spacing: 1px;">${item.product_name}</div>
        <div style="font-size: 11px; color: #999; margin-top: 4px; text-transform: uppercase;">Size: ${item.variant_size}</div>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666; font-size: 14px;">x${item.quantity}</td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #000; font-weight: bold; font-size: 14px;">₹${(item.unit_price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  const userMailOptions = {
    from: `"The Dress Outfitters" <${fromAddress}>`,
    to: to,
    subject: `Order Confirmation: #${data.orderNumber} - The Dress Outfitters`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;700&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #fdfcfb; font-family: 'Inter', sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#fdfcfb">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e8e4e1; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 60px 40px 40px 40px; border-bottom: 1px solid #f0f0f0;">
                    <h1 style="font-family: 'Playfair Display', serif; font-size: 28px; letter-spacing: 8px; color: #000; margin: 0; font-weight: 400; text-transform: uppercase;">The Dress Outfitters</h1>
                    <div style="margin-top: 15px; font-size: 10px; letter-spacing: 4px; color: #999; text-transform: uppercase; font-weight: 700;">Established Excellence</div>
                  </td>
                </tr>

                <!-- Intro -->
                <tr>
                  <td style="padding: 40px 40px 20px 40px;">
                    <h2 style="font-family: 'Playfair Display', serif; font-size: 20px; font-style: italic; font-weight: 400; color: #333; margin: 0;">Dear ${data.customerName},</h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 20px;">
                      Your commission has been successfully received and is now being processed by our master tailors. We are honored to be part of your professional wardrobe.
                    </p>
                  </td>
                </tr>

                <!-- Summary Header -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #fafafa; padding: 20px;">
                      <tr>
                        <td>
                          <div style="font-size: 10px; font-weight: bold; color: #999; text-transform: uppercase; letter-spacing: 2px;">Order Number</div>
                          <div style="font-size: 16px; color: #000; font-weight: bold; margin-top: 5px;">#${data.orderNumber}</div>
                        </td>
                        <td align="right">
                          <div style="font-size: 10px; font-weight: bold; color: #999; text-transform: uppercase; letter-spacing: 2px;">Date</div>
                          <div style="font-size: 16px; color: #000; font-weight: bold; margin-top: 5px;">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Items Table -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <thead>
                        <tr>
                          <th align="left" style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #999; padding-bottom: 15px; border-bottom: 2px solid #000;">Item</th>
                          <th align="center" style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #999; padding-bottom: 15px; border-bottom: 2px solid #000;">Qty</th>
                          <th align="right" style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #999; padding-bottom: 15px; border-bottom: 2px solid #000;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Totals -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="right">
                          <table width="200" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="padding: 5px 0; font-size: 14px; color: #666;">Handling & Delivery</td>
                              <td align="right" style="padding: 5px 0; font-size: 14px; color: #000;">Complimentary</td>
                            </tr>
                            <tr>
                              <td style="padding: 15px 0; font-size: 18px; font-weight: bold; color: #000; border-top: 1px solid #000;">Total</td>
                              <td align="right" style="padding: 15px 0; font-size: 18px; font-weight: bold; color: #D4AF37; border-top: 1px solid #000;">₹${data.totalAmount.toLocaleString()}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Shipping Info -->
                <tr>
                  <td style="padding: 20px 40px 40px 40px;">
                    <div style="font-size: 10px; font-weight: bold; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Destination</div>
                    <div style="font-size: 13px; color: #666; line-height: 1.6; background: #fafafa; padding: 20px; border-left: 4px solid #D4AF37;">
                      ${data.shippingAddress}
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 40px; background-color: #000; color: #ffffff;">
                    <div style="font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #666; margin-bottom: 20px;">Questions Regarding Your Order?</div>
                    <div style="font-size: 12px; color: #fff;">
                      Contact our concierge at <a href="mailto:support@thedressoutfitters.com" style="color: #D4AF37; text-decoration: none;">support@thedressoutfitters.com</a>
                    </div>
                    <div style="margin-top: 30px; font-size: 9px; color: #444; letter-spacing: 1px;">
                      &copy; ${new Date().getFullYear()} THE DRESS OUTFITTERS. ALL RIGHTS RESERVED.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    const adminResult = await transporter.sendMail(adminMailOptions);
    const userResult = await transporter.sendMail(userMailOptions);
    console.log("Emails sent successfully:", { admin: adminResult.messageId, user: userResult.messageId });
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
