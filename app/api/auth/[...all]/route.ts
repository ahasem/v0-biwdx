import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Better-auth API handler
export const { GET, POST } = toNextJsHandler(auth);
