import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

// Define red numbers for color bets
const redNumbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const { betId, result, outcome, betAmount, betType, choice } = req.body;

  // Log to check if betAmount is received correctly
  console.log("Received bet update request:", { betId, result, outcome, betAmount, betType, choice });

  if (!betId || result === undefined || !outcome || betAmount === undefined || !betType || choice === undefined) {
    return res.status(400).json({ message: "Missing bet details" });
  }

  let winnings = 0; // Change winnings to let so we can update it

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

    // Calculate winnings for number bets
    if (betType === "number" && result === choice) {
      // 15:1 payout for matching the number
      winnings = betAmount * 15;
    } else if (betType === "color") {
      // Color bet: check if the result is red or black
      const isRed = redNumbers.has(result);
      if ((choice === "red" && isRed) || (choice === "black" && !isRed && result !== 0)) {
        winnings = betAmount;
      }
    } else if (betType === "parity" && result !== 0) {
      // Parity bet: check if the result is even or odd
      if ((choice === "even" && result % 2 === 0) || (choice === "odd" && result % 2 !== 0)) {
        winnings = betAmount;
      }
    }

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
