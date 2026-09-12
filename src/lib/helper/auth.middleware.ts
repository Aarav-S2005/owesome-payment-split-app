import {COOKIE_TOKEN_KEY} from "@/lib/helper/auth.helper";
import {verifyToken} from "@/lib/helper/auth.helper";
import {cookies} from "next/headers";


export const authenticator = async (): Promise<string> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN_KEY)?.value
  if (!token) {
    throw new Error("Token Not Found");
  }
  const payload = verifyToken(token)
  if (!payload) {
    throw new Error("Failed to verify token");
  }
  return payload.email
}