import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { betId, result, outcome, winnings } = req.body;

  console.log("🔍 Received updateBet request:", { betId, result, outcome, winnings });

  if (!betId || typeof betId !== "string" || result === undefined) {
    console.error("🚨 Error: Invalid or missing data", { betId, result, outcome, winnings });
    return res.status(400).json({ message: "Invalid data received" });
  }

  try {
    const existingBet = await prisma.bet.findUnique({
      where: { id: betId },
    });

    if (!existingBet) {
      console.error("🚨 Error: Bet not found for ID", betId);
      return res.status(404).json({ message: "Bet not found" });
    }

    if (!existingBet.userId) {
      console.error("🚨 Error: No userId found for this bet", existingBet);
      return res.status(500).json({ message: "User ID is missing from bet" });
    }
    const updatedBet = await prisma.bet.update({
        where: { id: betId },
        data: { 
          result: outcome, // "W" or "L"
          tossedNumber: result, // ✅ Store the actual number that was spun
        },
      });
      

    console.log("✅ Updated bet with tossed number:", updatedBet);

    // ✅ If user won, update their balance
    if (outcome === "W") {
      console.log(`💰 Updating balance for userId: ${existingBet.userId}`);

      const updatedUser = await prisma.user.update({
        where: { id: existingBet.userId },
        data: { balance: { increment: winnings } },
      });

      console.log("✅ Updated user balance:", updatedUser);
    }

    return res.status(200).json(updatedBet);
  } catch (error) {
    console.error("🚨 Error updating bet:", error);
    return res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
  }
}
