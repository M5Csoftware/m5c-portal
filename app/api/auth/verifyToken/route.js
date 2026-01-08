import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/app/lib/db";
import User from "@/app/model/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

await connectDB();

export async function POST(request) {
    try {
        const { token } = await request.json();
        const session = await getServerSession(authOptions);

        if (!token) {
            return NextResponse.json({ error: "Token missing" }, { status: 400 });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // Optional: Check if user is logged in and matches the token
        if (session && session.user && session.user.id !== decoded.userId) {
            return NextResponse.json({ error: "Token does not match current session" }, { status: 403 });
        }

        // Update user in DB (pseudo code — change to match your schema)
        await User.updateOne({ _id: decoded.userId }, { $set: { verified: true } });
        return NextResponse.json({ success: true, message: "Email verified successfully" });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
