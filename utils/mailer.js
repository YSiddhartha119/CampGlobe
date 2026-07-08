const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(email, otp) {
    const mailOptions = {
        from: `"CampGlobe" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Your CampGlobe Verification Code',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f9f9f9; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">CampGlobe</h1>
                <p style="color: #a0aec0; margin: 8px 0 0;">Email Verification</p>
            </div>
            <div style="padding: 32px; background: #ffffff;">
                <p style="color: #2d3748; font-size: 16px; margin: 0 0 24px;">Hi there! Use the code below to verify your Gmail address and complete your CampGlobe registration.</p>
                <div style="background: #f7fafc; border: 2px dashed #e2e8f0; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 2px;">Your OTP Code</p>
                    <p style="color: #1a202c; font-size: 42px; font-weight: bold; letter-spacing: 12px; margin: 0; font-family: monospace;">${otp}</p>
                </div>
                <p style="color: #718096; font-size: 14px; margin: 0;">This code expires in <strong>10 minutes</strong>.</p>
                <p style="color: #718096; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
            </div>
            <div style="background: #f7fafc; padding: 16px; text-align: center;">
                <p style="color: #a0aec0; font-size: 12px; margin: 0;">Copyright ${new Date().getFullYear()} CampGlobe. All rights reserved.</p>
            </div>
        </div>
        `
    };
    await transporter.sendMail(mailOptions);
}

module.exports = { generateOTP, sendOTP };