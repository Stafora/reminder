import nodemailer from 'nodemailer'

export const sendMesageOnEmail = async (message: string) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SENDER_EMAIL_SERVICE_TYPE,
        port: Number(process.env.SENDER_EMAIL_SERVICE_PORT),
        secure: true,
        auth: {
            user: process.env.SENDER_EMAIL_LOGIN,
            pass: process.env.SENDER_EMAIL_PASSWORD
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"Reminder" <${process.env.SENDER_EMAIL_MAIL_FROM}>`,
            to: process.env.SENDER_EMAIL_MAIL_FROM,
            subject: 'Reminder',
            html: message
        });

        return info.messageId
    } catch (e){
        throw e
    }
}