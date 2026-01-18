import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {NEWS_SUMMARY_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE} from "@/lib/nodemailer/templates";

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

export const sendSummaryEmail = async ({email, date, newsContent}: {
    email: string;
    date: string;
    newsContent: string
}) => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace(`{{date}}`, date)
        .replace(`{{newsContent}}`, newsContent)

    const mailOptions = {
        from: `"Tickrflow News" <sarthaksarangi.dev@gmail.com>`,
        to: email,
        subject: `Market News Summary Today - ${date}`,
        text: `Today's market news summary - Tickrflow`,
        html: htmlTemplate
    }

    await transporter.sendMail(mailOptions)
}