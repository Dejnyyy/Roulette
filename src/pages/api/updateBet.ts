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
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const { betId, result, outcome, winnings } = req.body;

  if (!betId || result === undefined || !outcome) {
    return res.status(400).json({ message: "Missing bet details" });
  }

  try {
    console.log("🔍 Received updateBet request:", { betId, result, outcome, winnings });

    // ✅ Update bet result
    const updatedBet = await prisma.bet.update({
      where: { id: betId },
      data: {
        result: outcome,
        tossedNumber: result, // Store the actual tossed number
      },
    });

    console.log("✅ Updated bet with tossed number:", updatedBet);

    // ✅ If winnings > 0, update user balance
    if (winnings > 0) {
      console.log(`💰 Updating balance for userId: ${session.user.email}`);
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          balance: { increment: winnings }, // ✅ Add winnings to balance
        },
      });
      
      
    }

    return res.status(200).json(updatedBet);
  } catch (error) {
    console.error("🚨 Error updating bet:", error);
    return res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
  }
}
