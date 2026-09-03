/**
 * utils/sendSMS.js
 *
 * SMS Dispatch Utility for JanSewa.
 *
 * - Uses Twilio API when TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN are provided in .env.
 * - Falls back gracefully to console simulator logging for local development & testing.
 */

const isTwilioConfigured = () =>
  Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
  );

let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient && isTwilioConfigured()) {
    try {
      const twilio = require("twilio");
      twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } catch (err) {
      console.warn("Twilio package not available:", err.message);
    }
  }
  return twilioClient;
};

/**
 * Send SMS message to phone number
 * @param {Object} params
 * @param {string} params.to Phone number (e.g. +9779800000000 or 9800000000)
 * @param {string} params.message Text message content
 */
const sendSMS = async ({ to, message }) => {
  const recipient = to || "Citizen (Phone not provided)";

  if (!isTwilioConfigured()) {
    console.log("\n📱  SMS NOT CONFIGURED — printing message to console simulator:");
    console.log(`   To:      ${recipient}`);
    console.log(`   Time:    ${new Date().toLocaleString()}`);
    console.log(`   Message: ${message}\n`);
    return { delivered: false, reason: "Twilio API credentials not configured (Dev Mode)" };
  }

  try {
    const client = getTwilioClient();
    if (!client) {
      throw new Error("Twilio client failed to initialize");
    }

    const res = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: recipient,
    });

    console.log(`✔ SMS sent via Twilio to ${recipient} (SID: ${res.sid})`);
    return { delivered: true, sid: res.sid };
  } catch (error) {
    console.error(`✖ Failed to send SMS to ${recipient}:`, error.message);
    return { delivered: false, error: error.message };
  }
};

module.exports = sendSMS;
