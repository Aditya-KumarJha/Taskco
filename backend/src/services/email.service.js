import nodemailer from "nodemailer";
import { google } from "googleapis";
import { logger } from "../utils/logger.js";

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

if (
  !process.env.EMAIL_USER ||
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.REFRESH_TOKEN
) {
  logger.warn("⚠️ Missing OAuth2 env variables");
  logger.warn(
    "Required: EMAIL_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REFRESH_TOKEN"
  );
} else {
  logger.info("📧 Email service configured (OAuth2 ready)");
}

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
      
      const accessTokenPromise = oauth2Client.getAccessToken();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OAuth2 token timeout')), 10000)
      );
      
      const accessTokenResponse = await Promise.race([
        accessTokenPromise,
        timeoutPromise
      ]);
      
      const accessToken = accessTokenResponse?.token || accessTokenResponse;

      if (!accessToken) {
        throw new Error("❌ Access token not generated. Refresh token invalid.");
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.EMAIL_USER,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken,
        },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === "production",
        },
      });

      const info = await transporter.sendMail({
        from: `"Taskco" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text: text || html,
        html: html || text,
      });

      logger.info("✅ Email sent:", info.messageId, "to:", to);
      return info;
    } catch (error) {
      logger.error(`❌ Send email failed (attempt ${attempt}/${retries}):`);
      logger.error(error?.message || error);
      
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
