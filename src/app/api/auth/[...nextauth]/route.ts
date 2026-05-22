import NextAuth from "next-auth";
import { authOptions } from "@/libs/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };


//SERVER-SIDE Token Check (best)
//import { getServerSession } from "next-auth";
//import { useSession } from "next-auth/react";
//  const { data: session, status } = useSession();