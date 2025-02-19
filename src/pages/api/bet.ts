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

  console.log("📌 API Received Bet:", { amount, choice, type: typeof choice });

  if (!amount || choice === undefined || choice === null) {
    console.error("🚨 Invalid bet data:", { amount, choice });
    return res.status(400).json({ message: "Invalid bet data. Amount and choice are required." });
  }

  try {
    const bet = await prisma.bet.create({
      data: {
        userId: session.user.id,
        amount,
        choice,
        createdAt: new Date(),
        result: "pending",
      },
    });

    console.log("✅ Bet successfully saved:", bet);
    return res.status(200).json({ id: bet.id });
  } catch (error) {
    console.error("🚨 Prisma error while saving bet:", error);
    return res.status(500).json({ message: "Server error while placing bet." });
  }
}
