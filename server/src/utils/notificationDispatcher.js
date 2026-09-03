const Notification = require("../models/Notification");
const User = require("../models/User");
const sendEmail = require("./sendEmail");
const sendSMS = require("./sendSMS");
const { NOTIFICATION_TYPES } = require("../constants");

/**
 * Dispatch unified in-app, email, and SMS notifications
 *
 * @param {Object} options
 * @param {string|Object} options.recipient User ID or User object
 * @param {string} options.type Value from NOTIFICATION_TYPES
 * @param {string} options.message Brief notification text
 * @param {Object} options.complaint Complaint details (id, title, status, code)
 * @param {string} [options.extraNote] Optional status/department note
 */
const dispatchNotification = async ({ recipient, type, message, complaint, extraNote }) => {
  try {
    let user = recipient;
    if (typeof recipient === "string" || recipient instanceof Object === false || !recipient.email) {
      user = await User.findById(recipient);
    }

    if (!user) {
      console.warn("Notification Dispatcher: Recipient user not found");
      return;
    }

    // 1. Create In-App Notification Record
    const complaintId = complaint?._id || complaint?.id;
    await Notification.create({
      userId: user._id,
      message,
      type,
      complaintId,
    });

    const complaintCode = complaint?.code || (complaintId ? `CMP${complaintId.toString().slice(-6).toUpperCase()}` : "N/A");
    const complaintTitle = complaint?.title || "Public Complaint";

    // 2. Dispatch Email
    const emailSubject = `JanSewa Notification: ${complaintCode} — ${message.slice(0, 50)}`;
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #008080, #20b2aa); padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700;">JanSewa Civic Platform</h2>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Public Service Complaint Management System</p>
        </div>
        <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
          <p style="font-size: 15px; margin-top: 0;">Namaste <strong>${user.name}</strong>,</p>
          <p style="font-size: 14px; background: #f8fafc; padding: 14px; border-left: 4px solid #008080; border-radius: 6px;">
            ${message}
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 120px;">Complaint ID:</td>
              <td style="padding: 8px 0; font-weight: 700;">#${complaintCode}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Title:</td>
              <td style="padding: 8px 0; font-weight: 600;">${complaintTitle}</td>
            </tr>
            ${complaint?.status ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Current Status:</td>
              <td style="padding: 8px 0;"><span style="background: #e2e8f0; padding: 3px 10px; border-radius: 12px; font-weight: 700; font-size: 12px;">${complaint.status}</span></td>
            </tr>
            ` : ""}
            ${extraNote ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Note:</td>
              <td style="padding: 8px 0; font-style: italic; color: #334155;">"${extraNote}"</td>
            </tr>
            ` : ""}
          </table>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
            Thank you for helping keep Nepal clean, safe, and efficient. You can track this complaint anytime on JanSewa.
          </p>
        </div>
        <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 11.5px; color: #64748b; border-top: 1px solid #e2e8f0;">
          © ${new Date().getFullYear()} JanSewa Civic Platform — Government of Nepal Public Services
        </div>
      </div>
    `;

    sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailHtml,
    }).catch((err) => console.error("Email dispatch async error:", err.message));

    // 3. Dispatch SMS
    const smsMessage = `JanSewa Alert [#${complaintCode}]: ${message}${extraNote ? ` Note: ${extraNote}` : ""}`;
    const userPhone = user.phone || "+9779800000000";

    sendSMS({
      to: userPhone,
      message: smsMessage,
    }).catch((err) => console.error("SMS dispatch async error:", err.message));

  } catch (error) {
    console.error("Error in dispatchNotification:", error.message);
  }
};

module.exports = dispatchNotification;
