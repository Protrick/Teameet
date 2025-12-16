import transporter from "../config/nodemailer.js";

export async function sendMail({ from, to, subject, text, html }) {
  const mailOptions = {
    from: from || process.env.SENDER_EMAIL,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    // rethrow with minimal logging at caller
    throw err;
  }
}

export default sendMail;
