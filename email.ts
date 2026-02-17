import { Resend } from 'resend';

export class EmailService {
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    // Don't throw during initialization if key is missing
    this.resend = new Resend(apiKey || 'missing_key');
  }

  async sendNotification(to: string, subject: string, htmlContent: string) {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ Skipping email send: RESEND_API_KEY is missing.");
      return;
    }

    try {
      await this.resend.emails.send({
        from: 'Mithaq System <notifications@replitapp.com>',
        to,
        subject,
        html: htmlContent,
      });
    } catch (error) {
      console.error("❌ Failed to send email via Resend:", error);
    }
  }

  generateTemplate(title: string, message: string, actionUrl: string) {
    return `
      <div dir="rtl" style="font-family: 'Cairo', 'Tajawal', sans-serif; background-color: #f4f7f6; padding: 40px; text-align: right; border-radius: 8px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; border-top: 6px solid #006C35; shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #006C35; border-bottom: 2px solid #eee; padding-bottom: 15px; font-size: 24px;">${title}</h2>
          <p style="color: #444; font-size: 18px; line-height: 1.8; margin: 20px 0;">${message}</p>
          <div style="text-align: center; margin-top: 35px;">
            <a href="${actionUrl}" style="background-color: #006C35; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">الدخول إلى النظام</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #777; font-size: 13px; text-align: center;">هذا بريد إلكتروني تلقائي من نظام ميثاق الأداء - وزارة التعليم</p>
        </div>
      </div>
    `;
  }
}

export const emailService = new EmailService();
