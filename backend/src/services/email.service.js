import { Resend } from "resend";
import { logger } from "../utils/logger.js";

if (!process.env.RESEND_API_KEY) {
  logger.warn("⚠️ Missing RESEND_API_KEY in environment variables");
} else {
  logger.info("📧 Email service configured (Resend ready)");
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const sendEmail = async ({ to, subject, text, html }, retries = 3) => {
  if (!resend) {
    logger.error("❌ Cannot send email: RESEND_API_KEY is not configured");
    logger.error("Please set RESEND_API_KEY in your environment variables");
    return null;
  }

  const noRecipients = !to || (typeof to === "string" && !to.trim());

  if (noRecipients) {
    logger.warn("⚠️ No recipients for email:", subject);
    return null;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`📧 Sending email (attempt ${attempt}/${retries}):`, subject);
      logger.info(`📧 Recipient:`, to);

      const emailPayload = {
        from: "Taskco <no-reply@adityajha.qzz.io>",
        to: Array.isArray(to) ? to : [to],
        subject,
        text: text || undefined,
        html: html || (text ? `<p>${text}</p>` : undefined),
      };

      logger.info("📧 Email payload:", JSON.stringify({
        from: emailPayload.from,
        to: emailPayload.to,
        subject: emailPayload.subject,
        hasText: !!emailPayload.text,
        hasHtml: !!emailPayload.html
      }));

      const response = await resend.emails.send(emailPayload);

      if (response?.error) {
        const errorMsg = response.error.message || JSON.stringify(response.error);
        logger.error("❌ Resend API returned error:", errorMsg);
        throw new Error(`Resend API Error: ${errorMsg}`);
      }

      // Check if response is valid
      if (!response || !response.data) {
        logger.error("❌ Invalid response from Resend API:", JSON.stringify(response));
        throw new Error("Invalid response from Resend API");
      }

      logger.info("✅ Email sent successfully:", response.data.id, "to:", to);
      return response;
    } catch (error) {
      logger.error(`❌ Send email failed (attempt ${attempt}/${retries})`);
      
      // Log error message
      if (error?.message) {
        logger.error("Error message:", error.message);
      } else {
        logger.error("Error (no message property):", JSON.stringify(error, null, 2));
      }

      // Log response data if available
      if (error?.response) {
        logger.error("Error response:", JSON.stringify(error.response, null, 2));
      }

      // Log stack trace
      if (error?.stack) {
        logger.error("Stack trace:", error.stack);
      }

      // Log the full error object for debugging
      logger.error("Full error object:", {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        statusCode: error?.statusCode,
        type: typeof error,
        constructor: error?.constructor?.name
      });

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
