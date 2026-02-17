import { Resend } from "resend";
import { logger } from "../utils/logger.js";

if (!process.env.RESEND_API_KEY) {
  logger.warn("⚠️ Missing RESEND_API_KEY in environment variables");
} else {
  logger.info("📧 Email service configured (Resend ready)");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const sendEmail = async ({ to, subject, text, html }, retries = 3) => {
  const noRecipients = !to || (typeof to === "string" && !to.trim());

  if (noRecipients) {
    logger.warn("⚠️ No recipients for email:", subject);
    return null;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`📧 Sending email (attempt ${attempt}/${retries}):`, subject);

      const response = await resend.emails.send({
        from: "Taskco <onboarding@resend.dev>", 
        to: Array.isArray(to) ? to : [to],
        subject,
        text: text || undefined,
        html: html || (text ? `<p>${text}</p>` : undefined),
      });

      if (response?.error) {
        throw new Error(
          `Resend API Error: ${response.error.message || JSON.stringify(response.error)}`
        );
      }

      logger.info("✅ Email sent successfully:", response?.data?.id, "to:", to);
      return response;
    } catch (error) {
      logger.error(`❌ Send email failed (attempt ${attempt}/${retries})`);
      logger.error("Error message:", error?.message || error);

      if (error?.response) {
        logger.error("Error response:", error.response);
      }

      if (error?.stack) {
        logger.error("Stack trace:", error.stack);
      }

      if (attempt < retries) {
        const waitTime = attempt * 2000;
        logger.info(`⏳ Retrying in ${waitTime / 1000}s...`);
        await delay(waitTime);
      } else {
        logger.error(`❌ All ${retries} attempts failed for email to:`, to);
        return null;
      }
    }
  }

  return null;
};

export default sendEmail;
