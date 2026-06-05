const nodemailer = require("nodemailer");

/**
 * Creates a Nodemailer transporter from environment variables.
 * Supports Gmail, SendGrid SMTP, or any other SMTP provider.
 */
function createTransporter() {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Sends contact form notification email to the site owner.
 * @param {{ name: string, email: string, phone?: string, subject: string, message: string }} data
 */
async function sendContactEmail({ name, email, phone, subject, message }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("📧 Email not configured (SMTP_USER/SMTP_PASS missing). Skipping email send.");
    return;
  }

  const transporter = createTransporter();

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1e; color: #f9fafb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #00D4FF, #7C3AED); padding: 24px 32px;">
        <h2 style="margin: 0; color: white; font-size: 20px;">📬 New Portfolio Message</h2>
      </div>
      <div style="padding: 32px;">
        <p style="color: #9CA3AF; font-size: 14px; margin-top: 0;">You received a new contact message from your portfolio.</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #9CA3AF; font-size: 13px; width: 100px;">Name</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #9CA3AF; font-size: 13px;">Email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08);"><a href="mailto:${email}" style="color: #00D4FF;">${email}</a></td>
          </tr>
          ${phone ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #9CA3AF; font-size: 13px;">Phone</td><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">${phone}</td></tr>` : ""}
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); color: #9CA3AF; font-size: 13px;">Subject</td>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">${subject}</td>
          </tr>
        </table>

        <div style="margin-top: 24px; padding: 20px; background: rgba(255,255,255,0.04); border-radius: 10px; border-left: 3px solid #00D4FF;">
          <p style="margin: 0; line-height: 1.7; color: #D1D5DB;">${message.replace(/\n/g, "<br>")}</p>
        </div>

        <div style="margin-top: 24px;">
          <a href="mailto:${email}?subject=Re: ${subject}" style="display: inline-block; padding: 10px 24px; background: linear-gradient(135deg, #00D4FF, #7C3AED); color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Reply to ${name}
          </a>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
    replyTo: email,
    subject: `📬 Portfolio: ${subject} — from ${name}`,
    html,
    text: `New message from ${name} (${email})\n\nSubject: ${subject}\n\nMessage:\n${message}`,
  });

  console.log(`✅ Contact email sent for: ${name} <${email}>`);
}

module.exports = { sendContactEmail };
