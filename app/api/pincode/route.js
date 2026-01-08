import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const zipCode = searchParams.get("zipCode");

    try {
        const response = await fetch(`http://postalpincode.in/api/pincode/${zipCode}`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
