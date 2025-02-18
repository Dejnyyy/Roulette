// /pages/api/bet.ts
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
    return res.status(400).json({ message: "Invalid bet data." });
  }

  try {
    // Creating a bet without the result field
    // /pages/api/bet.ts
      const bet = await prisma.bet.create({
        data: {
          userId: session.user.id,
          amount,
          choice,
          createdAt: new Date(),
          result: "pending", // Default value while waiting for the result
        },
      });


    return res.status(200).json({ id: bet.id });
  } catch (error) {
    console.error("Error placing bet:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
