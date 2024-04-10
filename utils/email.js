import nodemailer from "nodemailer";
import process from "node:process";

const sendEmail = (options) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: options.from || "Shabbir <shabbirchatrissa@gmail.com>",
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  transporter.sendMail(mailOptions);
};

export { sendEmail };
