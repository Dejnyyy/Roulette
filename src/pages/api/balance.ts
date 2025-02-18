import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // ✅ Create user if not exists
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          balance: 1000, // ✅ Default balance for new users
        },
      });
    }

    return res.status(200).json({ balance: user.balance });
  } catch (error) {
    console.error("🚨 Error fetching balance:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
