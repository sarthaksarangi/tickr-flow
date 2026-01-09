import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {WELCOME_EMAIL_TEMPLATE} from "@/lib/nodemailer/templates";

dotenv.config();
export const transporter = nodemailer.createTransport(({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    }
}))

export const sendWelcomeEmail = async ({email, name, intro}: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace(`{{name}}`, name)
        .replace(`{{intro}}`, intro)

    const mailOptions = {
        from: `"Tickrflow" <sarthaksarangi.dev@gmail.com>`,
        to: email,
        subject: `Welcome to Tickrflow = your stock market toolkit is ready!`,
        text: 'Thanks for joining Tickrflow',
        html: htmlTemplate
    }
    
    await transporter.sendMail(mailOptions)
}