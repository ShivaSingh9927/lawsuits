const nodemailer = require("nodemailer");
require("dotenv").config();

async function runTest() {
  const user = "thedressoutfitters@gmail.com";
  const pass = "wkapgvaccvvuohtv"; // Your App Password

  console.log("Starting SMTP test with:", user);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  try {
    console.log("Verifying connection...");
    await transporter.verify();
    console.log("✅ Connection works! Attempting to send test email...");
    
    await transporter.sendMail({
      from: user,
      to: user,
      subject: "Test Email from TDO",
      text: "If you are reading this, your email configuration is perfect."
    });
    console.log("✅ Test email sent to yourself successfully!");
  } catch (error) {
    console.error("❌ TEST FAILED:");
    console.error(error);
    if (error.message.includes("Username and Password not accepted")) {
      console.log("\n💡 TIP: Please double-check that '2-Step Verification' is ON in your Google Account and that you generated a fresh 'App Password'.");
    }
  }
}

runTest();
