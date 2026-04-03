import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport(
  process.env.SMTP_HOST 
    ? {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL,
          pass: process.env.SMTP_PASS || process.env.APP_PASSWORD,
        },
      }
    : {
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.APP_PASSWORD,
        },
      }
);

// Verify connection on startup to catch configuration errors early
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Configuration Error:", error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
});


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

export async function sendFittingRequest(data: FittingEmailData) {
  const adminMailOptions = {
    from: `"Fitting Alert" <${process.env.EMAIL}>`,
    to: process.env.EMAIL,
    subject: `📅 NEW FITTING REQUEST - ${data.name}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; background: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; border: 1px solid #e5e5e5;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #eab308; padding-bottom: 10px; margin-bottom: 20px;">New Fitting Inquiry</h2>
          
          <div style="margin-bottom: 25px;">
            <h3 style="font-size: 14px; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 10px;">Advocate Details</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${data.name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${data.phone}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong><br/>${data.address}</p>
          </div>

          <div style="background: #fdfcfb; padding: 20px; border-radius: 4px; margin-bottom: 25px;">
            <h3 style="font-size: 14px; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 10px;">Proposed Schedule</h3>
            <p style="margin: 5px 0;"><strong>Preference:</strong> ${data.category}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${data.date}</p>
            <p style="margin: 5px 0;"><strong>Time Slot:</strong> ${data.timeSlot}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:${data.email}" style="background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
               Reply to Advocate
            </a>
          </div>
        </div>
      </div>
    `,
  };

  const userMailOptions = {
    from: `"The Dress Outfitters" <${process.env.EMAIL}>`,
    to: data.email,
    subject: `Fitting Request Received - The Dress Outfitters`,
    html: `
      <div style="background-color: #fafafa; padding: 40px 20px; font-family: 'Times New Roman', serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; padding: 40px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="margin:0; font-size: 24px; letter-spacing: 4px; text-transform: uppercase;">The Dress Outfitters</h1>
            <p style="margin:5px 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #999;">At-Home Atelier Service</p>
          </div>
          
          <h2 style="font-weight: 400; font-style: italic; font-size: 20px; margin-bottom: 20px;">Fitting Invitation Received</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #333;">Dear ${data.name},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #333;">Thank you for inviting our Master Tailor to your sanctuary. We have received your request for a personalized fitting session.</p>
          
          <div style="background: #fdfcfb; border-left: 4px solid #eab308; padding: 20px; margin: 30px 0;">
            <span style="font-size: 12px; text-transform: uppercase; color: #999; letter-spacing: 1px;">Scheduled Preference</span><br/>
            <strong style="font-size: 16px; color: #1a1a1a;">${data.date} | ${data.timeSlot}</strong><br/>
            <span style="font-size: 14px; color: #666;">Category: ${data.category}</span>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #333;">Our customer care team will review our lead tailor's schedule and coordinate with you shortly to finalize the appointment.</p>

          <div style="text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="font-size: 10px; color: #999; letter-spacing: 1px; text-transform: uppercase;">&copy; ${new Date().getFullYear()} THE DRESS OUTFITTERS. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);
    return { success: true };
  } catch (err) {
    console.error("Fitting Email Error:", err);
    return { success: false, error: err };
  }
}

export async function sendOrderConfirmation(
  to: string,
  data: OrderEmailData
) {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-family: sans-serif;">
        <div style="font-weight: 600; color: #1a1a1a;">${item.product_name}</div>
        <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Size: ${item.variant_size}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; font-family: sans-serif; color: #666;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-family: sans-serif; font-weight: 600;">₹${item.unit_price.toLocaleString()}</td>
    </tr>
  `
    )
    .join("");

  // Email to Customer
  const customerMailOptions = {
    from: `"The Dress Outfitters" <${process.env.EMAIL}>`,
    to: to,
    subject: `Order Confirmed: #${data.orderNumber} - The Dress Outfitters`,
    html: `
      <div style="background-color: #fafafa; padding: 40px 20px; font-family: 'Times New Roman', serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; padding: 40px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="margin:0; font-size: 24px; letter-spacing: 4px; text-transform: uppercase;">The Dress Outfitters</h1>
            <p style="margin:5px 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #999;">Courtroom Excellence • Since 2026</p>
          </div>
          
          <h2 style="font-weight: 400; font-style: italic; font-size: 20px; margin-bottom: 20px;">Confirmation of Order</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #333;">Dear ${data.customerName},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #333;">It is our privilege to confirm your recent acquisition. Our atelier is now meticulously preparing your selections for delivery.</p>
          
          <div style="background: #fdfcfb; border-left: 4px solid #eab308; padding: 20px; margin: 30px 0;">
            <span style="font-size: 12px; text-transform: uppercase; color: #999; letter-spacing: 1px;">Order Reference</span><br/>
            <strong style="font-size: 18px; color: #1a1a1a;">#${data.orderNumber}</strong>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="text-align: left; border-bottom: 2px solid #1a1a1a;">
                <th style="padding: 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 20px 12px 10px; text-align: right; font-size: 14px; color: #666;">Grand Total</td>
                <td style="padding: 20px 12px 10px; text-align: right; color: #eab308; font-size: 20px; font-weight: 600;">₹${data.totalAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div style="border-top: 1px solid #eee; padding-top: 30px;">
            <h4 style="margin:0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Shipping Destination</h4>
            <p style="font-size: 14px; color: #333; line-height: 1.6; white-space: pre-wrap;">${data.shippingAddress}</p>
          </div>

          <p style="margin-top: 40px; font-size: 12px; color: #666; font-style: italic; border-top: 1px solid #eee; padding-top: 20px;">
            A representative from our customer care team will coordinate with you shortly regarding the details of your fitting.
          </p>

          <div style="text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="font-size: 10px; color: #999; letter-spacing: 1px; text-transform: uppercase;">&copy; ${new Date().getFullYear()} THE DRESS OUTFITTERS. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </div>
    `,
  };

  // Email to Admin
  const adminMailOptions = {
    from: `"Store Alert" <${process.env.EMAIL}>`,
    to: process.env.EMAIL,
    subject: `🔔 NEW ORDER - #${data.orderNumber} - ₹${data.totalAmount.toLocaleString()}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; background: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px;">New Order Received</h2>
          <p><strong>Customer:</strong> ${data.customerName} (${to})</p>
          <p><strong>Order ID:</strong> #${data.orderNumber}</p>
          <p><strong>Total:</strong> ₹${data.totalAmount.toLocaleString()}</p>
          <p><strong>Address:</strong><br/>${data.shippingAddress}</p>
          
          <h3 style="margin-top: 30px;">Items Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
          </table>
          
          <div style="margin-top: 40px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders" 
               style="background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
               View Order in Admin Panel
            </a>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);
    return { success: true };
  } catch (err) {
    console.error("Order Email Error:", err);
    return { success: false, error: err };
  }
}
