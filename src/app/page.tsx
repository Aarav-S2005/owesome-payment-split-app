import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth.actions";
import Header from "@/sections/home/Header";
import DashboardClient from "@/sections/home/DashboardClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ groupID?: string }>;
}) {
  const params = await searchParams;
  let user: { name: string; email: string } | null = null;

  try {
    user = await getUser();
  } catch (e) {
    if (params.groupID) {
      redirect(`/auth?groupID=${params.groupID}`);
    }
    redirect("/auth");
  }

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      <Header name={user.name} />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-24 flex flex-col items-center justify-center text-muted gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-sm">Loading your dashboard...</p>
            </div>
          }
        >
          <DashboardClient name={user.name} email={user.email} />
        </Suspense>
      </main>
    </div>
  );
}
