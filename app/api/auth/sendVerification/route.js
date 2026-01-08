// /app/api/auth/sendVerification/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export async function POST(request) {
    try {
        const { email, fullName, userId } = await request.json();

        if (!email || !fullName || !userId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Generate verification token (expires in 24h)
        const token = jwt.sign(
            { email, userId },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        const verifyUrl = `m5c-web-xyz.vercel.app/auth/thankYouPage?token=${token}`;

        // Setup transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Email content
        const mailOptions = {
            from: `"M5C Logistics" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Verify Your M5C Account",
            html: `
        <h2>Hi ${fullName},</h2>
        <p>Thanks for signing up. Please verify your email by clicking the button below:</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#EA1B40;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: "Verification email sent" });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
