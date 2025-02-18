// /pages/api/updateBet.ts
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

  const { betId, result, outcome, winnings, betAmount } = req.body;

  // Log to check if betAmount is received correctly
  console.log("Received bet update request:", { betId, result, outcome, winnings, betAmount });

  if (!betId || result === undefined || !outcome || winnings === undefined || betAmount === undefined) {
    return res.status(400).json({ message: "Missing bet details" });
  }

  try {
    // Update the bet with the result and outcome (win/loss)
    const updatedBet = await prisma.bet.update({
      where: { id: betId },
      data: {
        result: outcome,
        tossedNumber: result, // Store the actual tossed number
      },
    });

    console.log("Updated bet with tossed number:", updatedBet);

    // If winnings > 0 (win), update user balance by incrementing
    if (winnings > 0) {
      console.log(`User won! Updating balance for user: ${session.user.email}`);
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          balance: { increment: winnings }, // Add winnings to balance
        },
      });
    } else {
      // If outcome is a loss (outcome == "L"), subtract the bet amount
      console.log(`User lost! Deducting bet amount from balance for user: ${session.user.email}`);
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          balance: { decrement: betAmount }, // Subtract betAmount from balance
        },
      });
    }

    return res.status(200).json(updatedBet);
  } catch (error) {
    console.error("Error updating bet:", error);
    return res.status(500).json({ message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
  }
}
