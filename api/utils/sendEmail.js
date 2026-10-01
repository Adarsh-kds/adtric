const nodemailer = require("nodemailer");

const sendEmail = async (enquiry, projectName) => {
  try {
    const { SMTP_SERVER, SMTP_PORT, SMTP_LOGIN, SMTP_KEY, MAIL_FROM, MAIL_TO } =
      process.env;

    if (!SMTP_SERVER || !SMTP_LOGIN || !SMTP_KEY || !MAIL_TO) {
      return;
    }

    const port = Number(SMTP_PORT) || 587;

    const transporter = nodemailer.createTransport({
      host: SMTP_SERVER,
      port,
      secure: port === 465,
      auth: { user: SMTP_LOGIN, pass: SMTP_KEY },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    const text = [
      `Project: ${projectName}`,
      `Name: ${enquiry.name}`,
      `Mobile: ${enquiry.mobile}`,
      `Email: ${enquiry.email || "-"}`,
      `Message: ${enquiry.message || "-"}`,
    ].join("\n");

    await transporter.sendMail({
      from: MAIL_FROM || SMTP_LOGIN,
      to: MAIL_TO,
      subject: `New enquiry for ${projectName}`,
      text,
    });
  } catch (error) {
    console.error("Email alert failed:", error.message);
  }
};

module.exports = sendEmail;
