"use client"; // Needed only for Next.js App Router, safe to remove for Pages Router

import { useSession, signIn, signOut } from "next-auth/react";

export default function Sign() {
  const { data: session } = useSession();

  return (
    <div className="bg-white text-black hover:scale-110 font-bold px-4 py-2 rounded-lg">
      {session ? (
        <div>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      ) : (
        <button onClick={() => signIn("google")}>Sign in with Google</button>
      )}
    </div>
  );
}
