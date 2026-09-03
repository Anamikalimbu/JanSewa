const { COMPLAINT_STATUSES } = require("../constants");

exports.getWelcomeEmail = (name) => ({
  subject: "Welcome to JanSewa",
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2>Welcome to JanSewa, ${name}!</h2>
      <p>Your account has been successfully created. You can now log in to report issues and track public service complaints.</p>
      <p><a href="${process.env.CLIENT_URL}/login" style="background: #008080; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In</a></p>
    </div>
  `
});

exports.getPendingRequestEmail = (name) => ({
  subject: "JanSewa Account Request Submitted",
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2>Hello ${name},</h2>
      <p>Your request for a staff account has been submitted and is awaiting admin approval.</p>
      <p>We will notify you once your account has been approved.</p>
    </div>
  `
});

exports.getNewLoginEmail = (name, dateStr) => ({
  subject: "New login to your JanSewa account",
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2>Hello ${name},</h2>
      <p>We noticed a new login to your JanSewa account on <strong>${dateStr}</strong>.</p>
      <p>If this was you, you can safely ignore this email.</p>
    </div>
  `
});

exports.getComplaintSubmittedEmail = (name, complaint) => ({
  subject: `Complaint submitted — ${complaint.title}`,
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2>Hello ${name},</h2>
      <p>Your complaint has been successfully submitted and is pending review.</p>
      <p><strong>Title:</strong> ${complaint.title}<br/>
      <strong>Category:</strong> ${complaint.category}<br/>
      <strong>Ward:</strong> ${complaint.wardNumber}</p>
      <p><a href="${process.env.CLIENT_URL}/complaints/${complaint._id}" style="background: #008080; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">View Complaint</a></p>
    </div>
  `
});

exports.getComplaintStatusEmail = (name, status, complaintTitle, complaintId, note = "") => {
  let message = "";
  
  if (status === COMPLAINT_STATUSES.ASSIGNED) {
    message = "Your complaint has been assigned to a department";
  } else if (status === COMPLAINT_STATUSES.IN_PROGRESS) {
    message = "Work has started on your complaint";
  } else if (status === COMPLAINT_STATUSES.RESOLVED) {
    message = "Your complaint has been resolved";
  } else if (status === COMPLAINT_STATUSES.CLOSED) {
    message = "Your complaint has been closed";
  } else {
    message = `Your complaint status has been updated to ${status}`;
  }

  const noteHtml = note ? `<p><strong>Note:</strong> ${note}</p>` : "";

  return {
    subject: `Complaint Status Update: ${message}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2>Hello ${name},</h2>
        <p>${message}.</p>
        <p><strong>Complaint Title:</strong> ${complaintTitle}</p>
        ${noteHtml}
        <p><a href="${process.env.CLIENT_URL}/complaints/${complaintId}" style="background: #008080; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">View Complaint</a></p>
      </div>
    `
  };
};
