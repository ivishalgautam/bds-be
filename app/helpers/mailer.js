import config from "../config/index.js";
import nodemailer from "nodemailer";

const sendMail = async (receipent_email, subject, text = null, html = null) => {
  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: config.smtp_port,
    secure: true,
    auth: {
      user: config.smtp_from_email,
      pass: config.smtp_password,
    },
  });
  return await transporter.sendMail({
    from: `'BDS' <${config.smtp_from_email}>`,
    to: receipent_email,
    subject: subject,
    text: text,
    html: html,
  });
};

export default sendMail;
