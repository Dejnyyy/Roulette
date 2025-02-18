import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
  }
}

export type UserCreateInput = {
  id?: string;
  email: string;
  name?: string | null;
  image?: string | null; // ✅ This must be present
  balance?: number;
};
