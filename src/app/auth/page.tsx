import { cookies } from "next/headers";
import { authenticator } from "@/lib/helper/auth.middleware";
import { redirect } from "next/navigation";
import Tabs from "@/sections/auth/Tabs";
import { cookie as cookieFont, delius } from "@/utils/fonts";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ groupID?: string; redirectUrl?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth-token")?.value;

  if (authToken) {
    let isAuthenticated = false;
    try {
      await authenticator();
      isAuthenticated = true;
    } catch (e) {
      // Token is invalid/expired
    }
    if (isAuthenticated) {
      if (params.groupID) {
        redirect(`/?groupID=${params.groupID}`);
      }
      if (params.redirectUrl) {
        redirect(params.redirectUrl);
      }
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4 py-8">
      <div className="text-center mb-6">
        <h1 className={`${cookieFont.className} text-6xl text-default-foreground mb-1 tracking-wide`}>
          OweSome
        </h1>
        <p className={`${delius.className} text-muted text-base sm:text-lg`}>
          Split expenses with friends, seamlessly.
        </p>
        {params.groupID && (
          <div className={`${delius.className} mt-3 inline-block px-3.5 py-1.5 bg-accent/10 border border-accent/30 rounded-xl text-accent text-xs font-semibold`}>
            Sign in or create an account to join the group invitation!
          </div>
        )}
      </div>
      <div className="w-full max-w-md">
        <Tabs />
      </div>
    </div>
  );
}