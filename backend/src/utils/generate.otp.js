const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

export function generateOTP() {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  return { code, expiresAt };
}

export default generateOTP;
