// pages/api/addBalance.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth"; // or however you manage your sessions
import { authOptions } from "./auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { amount } = req.body;
    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ message: "Invalid amount." });
    }

    // Example: get the user from DB
    // Assume you store the user in your DB with an email or userId
    const userEmail = session.user?.email;
    if (!userEmail) {
      return res.status(400).json({ message: "No user email found in session." });
    }

    // Use your DB logic (here, using Prisma as an example)
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update user’s balance
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        balance: user.balance + amount,
      },
    });

    // Return the new balance
    return res.status(200).json({ newBalance: updatedUser.balance });
  } catch (error) {
    console.error("Error in addBalance API:", error);
    return res.status(500).json({ message: "Server Error" });
  }
}
