import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    image?: string | null;
    balance?: number;
  }
}


export type UserCreateInput = {
  id?: string;
  email: string;
  name?: string | null;
  image?: string | null; // ✅ This must be present
  balance?: number;
};
