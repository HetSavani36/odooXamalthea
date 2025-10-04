import nodemailer from "nodemailer"

import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter error:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});


export const sendEmail = async (to, subject, text, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"ExpenseApp" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (err) {
    console.error("Error while sending mail", err);
    throw err;
  }
};
