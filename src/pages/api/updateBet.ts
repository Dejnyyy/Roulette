import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { betId, result, outcome, winnings } = req.body;

  console.log("🔍 Received updateBet request:", { betId, result, outcome, winnings });

  if (!betId || typeof betId !== "string") {
    console.error("🚨 Error: Invalid or missing betId", betId);
    return res.status(400).json({ message: "Invalid bet ID" });
  }

  try {
    // ✅ Fetch the bet to ensure it exists
    const existingBet = await prisma.bet.findUnique({
      where: { id: betId },
    });

    console.log("📌 Fetched existing bet:", existingBet);

    if (!existingBet) {
      console.error("🚨 Error: Bet not found for ID", betId);
      return res.status(404).json({ message: "Bet not found" });
    }

    // ✅ Ensure `existingBet` is not null
    if (!existingBet.userId) {
      console.error("🚨 Error: No userId found for this bet", existingBet);
      return res.status(500).json({ message: "User ID is missing from bet" });
    }

    // ✅ Update the bet with the final result
    const updatedBet = await prisma.bet.update({
      where: { id: betId },
      data: { result: outcome },
    });

    console.log("✅ Updated bet:", updatedBet);

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

    // ✅ Ensure error is an instance of Error before accessing `.message`
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({ message: "Server error", error: errorMessage });
  }
}
