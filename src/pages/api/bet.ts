import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // Get user session
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  // Get bet data from the request body
  const { amount, choice } = req.body;

  // Validate the request body data
  if (!amount || !choice) {
    return res.status(400).json({ message: "Invalid bet data. Amount and choice are required." });
  }

  // Ensure the amount is valid
  if (amount <= 0) {
    return res.status(400).json({ message: "Bet amount must be greater than 0." });
  }

  try {
    // Create a new bet in the database without the result (result will be updated later)
    const bet = await prisma.bet.create({
      data: {
        userId: session.user.id,
        amount,
        choice,
        createdAt: new Date(),
        result: "pending", // Default value while waiting for the result
      },
    });

    // Return a successful response with the bet ID
    return res.status(200).json({ id: bet.id, message: "Bet placed successfully" });
  } catch (error) {
    console.error("Error placing bet:", error);
    return res.status(500).json({ message: "Server error while placing bet." });
  }
}
