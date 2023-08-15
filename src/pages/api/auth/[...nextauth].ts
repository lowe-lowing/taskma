import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth.js";

export default NextAuth(authOptions);
