// Generates a 6-digit numeric OTP, e.g. "483920"
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const OTP_EXPIRY_MINUTES = 5;

module.exports = { generateOTP, OTP_EXPIRY_MINUTES };