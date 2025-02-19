import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
        console.error("❌ Unauthorized access attempt.");
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const { amount, choice } = req.body;

    console.log("🔍 Received bet data:", { amount, choice });

    if (!amount || choice === undefined || choice === null) {
        console.error("❌ Invalid bet data received:", { amount, choice });
        return res.status(400).json({ message: "Invalid bet data. Amount and choice are required." });
    }

    try {
        // Ensure the user exists in the database
        let user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            console.error("❌ User not found in database:", session.user.email);
            return res.status(404).json({ message: "User not found." });
        }

        console.log("✅ User exists, placing bet...");

        // Creating a bet entry in the database
        const bet = await prisma.bet.create({
            data: {
                userId: user.id, // Make sure user.id exists
                amount,
                choice,
                createdAt: new Date(),
                result: "pending", // Default result
            },
        });

        console.log("✅ Bet placed successfully:", bet);
        return res.status(200).json({ id: bet.id, message: "Bet placed successfully" });

    } catch (error) {
        console.error("🚨 Server error while placing bet:", error);
        return res.status(500).json({ message: "Server error while placing bet.", error: error instanceof Error ? error.message : "Unknown error" });
    }
}
