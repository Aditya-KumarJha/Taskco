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

export const sendEmail = async ({ to, subject, text, html }) => {
  const noRecipients = !to || (typeof to === "string" && !to.trim());
  if (noRecipients) {
    logger.warn("⚠️ No recipients for email:", subject);
    return null;
  }

  try {
    const accessTokenResponse = await oauth2Client.getAccessToken();
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
    logger.error("❌ Send email failed:");
    logger.error(error?.message || error);
    return null;
  }
};

export default sendEmail;
