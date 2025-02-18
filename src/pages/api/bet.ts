import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // ✅ Ensure correct import

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // ✅ Get the user's session
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    console.error("🚨 No user email found in session:", session?.user);
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const { amount, choice } = req.body;

  if (!amount || !choice) {
    return res.status(400).json({ message: "Missing bet details" });
  }

  try {
    console.log("🔍 Searching for user in DB:", session.user.email);

    // ✅ Fetch the user from the database
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // ✅ If the user doesn't exist, create them (failsafe)
    if (!user) {
      console.log("🚨 User not found! Creating a new user...");
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || "Unknown",
          image: session.user.image || null,
        },
      });
    }

    console.log("✅ User found/created:", user.id);

    // ✅ Store bets using user ID (not email)
    const newBet = await prisma.bet.create({
      data: {
        userId: user.id, // ✅ Use ID from the database, not email
        amount,
        choice,
        result: "pending",
        tossedNumber: null, // Will be updated later
      },
    });

    console.log("✅ Bet placed successfully:", newBet);
    return res.status(201).json({ id: newBet.id, message: "Bet placed successfully" });
  } catch (error) {
    console.error("🚨 Error placing bet:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
