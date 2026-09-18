"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BalanceIsland from "@/sections/home/BalanceIsland";
import GroupsIsland from "@/sections/home/GroupsIsland";
import { joinGroup } from "@/lib/actions/groups.actions";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";

interface DashboardClientProps {
  name: string;
  email: string;
}

export default function DashboardClient({ name, email }: DashboardClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const groupIDParam = searchParams.get("groupID");

  useEffect(() => {
    if (groupIDParam) {
      async function handleAutoJoin() {
        try {
          await joinGroup(groupIDParam!);
          toast.success("Successfully joined the group!", {
            icon: <UserCheck className="w-4 h-4 text-success" />,
          });
          setRefreshKey((prev) => prev + 1);
          router.replace("/");
        } catch (err: any) {
          if (!err.message?.includes("Already joined")) {
            toast.error(err instanceof Error ? err.message : "Failed to join group");
          }
        }
      }
      handleAutoJoin();
    }
  }, [groupIDParam, router]);

  function triggerRefresh() {
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Balance Summary & Pending Approvals */}
        <div className="w-full lg:w-1/3 shrink-0">
          <BalanceIsland
            name={name}
            email={email}
            refreshTrigger={refreshKey}
            onStatsChange={triggerRefresh}
          />
        </div>

        {/* Right Column: Group Selector, Members, & Expense Splits */}
        <div className="w-full lg:w-2/3">
          <GroupsIsland
            currentUserEmail={email}
            currentUserName={name}
            initialGroupId={groupIDParam}
            refreshTrigger={refreshKey}
            onSplitUpdated={triggerRefresh}
          />
        </div>
      </div>
    </div>
  );
}
