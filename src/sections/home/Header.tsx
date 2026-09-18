"use client";

import { cookie, delius } from "@/utils/fonts";
import { Button } from "@heroui/react";
import { LogOut } from "lucide-react";
import Avatar from "@/sections/home/Avatar";
import { logoutUser } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export default function Header({ name }: { name: string }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      toast.info("Logged out successfully");
      router.push("/auth");
      router.refresh();
    } catch (e) {
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3 bg-surface/90 backdrop-blur-md border-b border-border shadow-xs">
      <div className="flex items-center gap-2">
        <h1 className={`${cookie.className} text-4xl sm:text-5xl text-default-foreground tracking-wide select-none`}>
          OweSome
        </h1>
      </div>

      <div className={`flex items-center gap-3 ${delius.className}`}>
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-sm font-semibold text-foreground leading-tight">
            {name}
          </span>
          <span className="text-xs text-muted">Signed In</span>
        </div>

        <Avatar char={name ? name.charAt(0).toUpperCase() : "U"} />

        <Button
          onClick={handleLogout}
          isDisabled={isLoggingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-border bg-background hover:bg-danger hover:text-danger-foreground transition cursor-pointer text-muted hover:border-danger"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}