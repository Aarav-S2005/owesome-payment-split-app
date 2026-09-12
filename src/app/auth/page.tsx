import {cookies} from "next/headers";
import {authenticator} from "@/lib/helper/auth.middleware";
import {redirect} from "next/navigation";
import Tabs from "@/sections/auth/Tabs";

export default async function AuthPage() {

  const cookie = await cookies();
  const auth_token = cookie.get("auth-token")?.value;
  if (auth_token) {
    try {
      const email = await authenticator()
      localStorage.setItem("email", email)
      redirect("/groups")
    } catch (e) {
      console.log("user not logged in")
    }
  }

  return (
    <div className="min-h-screen overflow-hidden flex items-start pt-32 justify-center bg-surface px-5 md:px-0">
      <Tabs />
    </div>
  )
}