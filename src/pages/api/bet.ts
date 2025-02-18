import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]"; // Make sure this path is correct

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const { amount, choice } = req.body;

  if (!amount || !choice) {
    return res.status(400).json({ message: "Missing bet details" });
  }

  try {
    const newBet = await prisma.bet.create({
        data: {
          userId: session.user.email, // ✅ Guaranteed to be a string
          amount,
          choice,
          result: "pending",
        },
      });
      
      if (!newBet.id) {
        console.error("Error: Bet creation failed", newBet);
        return res.status(500).json({ message: "Failed to create bet" });
      }
      
      return res.status(201).json({ id: newBet.id, message: "Bet placed successfully" });
      
  } catch (error) {
    console.error("Error placing bet:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
