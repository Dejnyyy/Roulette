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

  const { amount, choice } = req.body;

  if (!amount || !choice) {
    return res.status(400).json({ message: "Missing bet details" });
  }

  try {
    // ✅ Deduct balance from user
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { balance: { decrement: amount } },
    });

    // ✅ Create bet
    const newBet = await prisma.bet.create({
      data: {
        userId: session.user.email,
        amount,
        choice,
        result: "pending",
      },
    });

    return res.status(201).json({ id: newBet.id, balance: user.balance });
  } catch (error) {
    console.error("🚨 Error placing bet:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
