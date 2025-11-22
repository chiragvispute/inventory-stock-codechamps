import crypto from 'crypto';

// Generate random 6-digit OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Generate OTP without expiration for simplicity
export const generateOTPWithExpiry = () => {
  const otp = generateOTP();
  
  console.log('OTP Generation:');
  console.log('- Current UTC time:', new Date().toISOString());
  console.log('- OTP:', otp);
  
  return { otp, expiresAt: null };
};

// Verify OTP without expiry checking
export const verifyOTP = (storedOTP, storedExpiry, providedOTP) => {
  console.log('OTP Verification Debug:');
  console.log('- Stored OTP:', storedOTP);
  console.log('- Provided OTP:', providedOTP);
  
  if (storedOTP !== providedOTP) {
    return { valid: false, reason: 'Invalid OTP' };
  }
  
  return { valid: true, reason: 'OTP verified successfully' };
};

// Log OTP to console for development/testing
export const logOTPForTesting = (email, otp) => {
  console.log('\n===========================================');
  console.log('🔐 PASSWORD RESET OTP');
  console.log('===========================================');
  console.log(`📧 Email: ${email}`);
  console.log(`🔢 OTP: ${otp}`);
  console.log(`⏰ Generated at: ${new Date().toISOString()}`);
  console.log('===========================================\n');
};

// Dummy function for backward compatibility
export const sendOTPEmail = async (email, otp, userName = '') => {
  // Just log to console
  logOTPForTesting(email, otp);
  return { success: true, messageId: 'console-logged' };
};