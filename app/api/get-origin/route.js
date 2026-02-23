import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import CustomerAccount from "@/app/model/CustomerAccount";
import mongoose from "mongoose";

// Inline entity schema to avoid model registration issues
const EntitySchema = new mongoose.Schema(
    {
        entityType: String,
        code: String,
        name: String,
        sector: String,
        activateOnPortal: Boolean,
        activateOnSoftware: Boolean,
    },
    { collection: "entities" }
);

const Entity =
    mongoose.models.Entity || mongoose.model("Entity", EntitySchema);

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const accountCode = searchParams.get("accountCode");

        if (!accountCode) {
            return NextResponse.json(
                { success: false, message: "accountCode is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Step 1: Get the customer's branch code
        const customer = await CustomerAccount.findOne(
            { accountCode },
            { branch: 1 }
        ).lean();

        if (!customer) {
            return NextResponse.json(
                { success: false, message: "Customer account not found" },
                { status: 404 }
            );
        }

        const branchCode = customer.branch;

        if (!branchCode) {
            return NextResponse.json(
                { success: false, message: "No branch set for this account" },
                { status: 404 }
            );
        }

        // Step 2: Look up the entity name using the branch code
        const entity = await Entity.findOne(
            { code: branchCode },
            { name: 1, code: 1 }
        ).lean();

        if (!entity) {
            return NextResponse.json(
                {
                    success: false,
                    message: `No entity found for branch code: ${branchCode}`,
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            branchCode: branchCode,
            originName: entity.name,
        });
    } catch (error) {
        console.error("Error fetching origin:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
