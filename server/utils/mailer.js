import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetPasswordEmail({ to, firstName, resetToken }) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  await resend.emails.send({
    from: "CalorieApp <onboarding@resend.dev>",
    to,
    subject: "Reset your password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f2f7f5;border-radius:12px">
        <h2 style="color:#0b6630">Hi ${firstName || "there"} 👋</h2>
        <p style="color:#333">We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:20px 0;padding:12px 28px;background:#0b6630;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">
          Reset Password
        </a>
        <p style="color:#888;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:24px 0"/>
        <p style="color:#aaa;font-size:11px">© CalorieApp</p>
      </div>
    `,
  });
}