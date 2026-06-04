const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const transport = getTransporter();
  if (!transport) {
    console.log("[email] SMTP not configured — would send:", { to, subject });
    return { skipped: true };
  }
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  return transport.sendMail({ from, to, subject, text, html });
}

async function sendApprovalEmail(user) {
  const name = user.name || "there";
  const roleLabel = user.role === "employer" ? "employer" : "student";
  return sendMail({
    to: user.email,
    subject: "InternHub — Account approved",
    text: `Hi ${name},\n\nYour ${roleLabel} account has been approved. You can now sign in and use all features.\n\n— InternHub`,
    html: `<p>Hi ${name},</p><p>Your <strong>${roleLabel}</strong> account has been <strong>approved</strong>. Sign in to continue.</p><p>— InternHub</p>`,
  });
}

async function sendRejectionEmail(user, reason) {
  const name = user.name || "there";
  const roleLabel = user.role === "employer" ? "employer" : "student";
  const why = reason ? `<p><strong>Reason:</strong> ${reason}</p>` : "";
  return sendMail({
    to: user.email,
    subject: "InternHub — Account not approved",
    text: `Hi ${name},\n\nYour ${roleLabel} registration was not approved.${reason ? ` Reason: ${reason}` : ""}\n\n— InternHub`,
    html: `<p>Hi ${name},</p><p>Your <strong>${roleLabel}</strong> registration was <strong>not approved</strong>.</p>${why}<p>— InternHub</p>`,
  });
}

async function sendShortlistedEmail(user, internshipTitle) {
  const name = user.name || "there";
  return sendMail({
    to: user.email,
    subject: "InternHub — Application shortlisted",
    text: `Hi ${name},\n\nCongratulations! Your application for ${internshipTitle} has been shortlisted. The employer will contact you for further rounds.\n\n— InternHub`,
    html: `<p>Hi ${name},</p><p>Congratulations! Your application for <strong>${internshipTitle}</strong> has been <strong>shortlisted</strong>. The employer will contact you for further rounds.</p><p>— InternHub</p>`,
  });
}

async function sendHiredEmail(user, internshipTitle) {
  const name = user.name || "there";
  return sendMail({
    to: user.email,
    subject: "InternHub — You have been hired!",
    text: `Hi ${name},\n\nCongratulations! You have been selected for the ${internshipTitle} position. Welcome to the team!\n\n— InternHub`,
    html: `<p>Hi ${name},</p><p>Congratulations! You have been <strong>hired</strong> for the <strong>${internshipTitle}</strong> position. Welcome to the team!</p><p>— InternHub</p>`,
  });
}

async function sendNotEligibleEmail(user) {
  const name = user.name || "there";
  return sendMail({
    to: user.email,
    subject: "InternHub — Application update",
    text: `Hi ${name},\n\nYour application does not meet the requirements for this position. Please review your profile and apply to other opportunities.\n\n— InternHub`,
    html: `<p>Hi ${name},</p><p>Your application does not meet the requirements for this position. Please review your profile and apply to other opportunities.</p><p>— InternHub</p>`,
  });
}

module.exports = { 
  sendMail, 
  sendApprovalEmail, 
  sendRejectionEmail,
  sendShortlistedEmail,
  sendHiredEmail,
  sendNotEligibleEmail
};
