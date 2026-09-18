"use client";

import { useEffect, useState, useCallback } from "react";
import { delius } from "@/utils/fonts";
import {
  userStatistics,
  approveSplit,
  rejectSplit,
  UserBalanceSummary,
} from "@/lib/actions/splits.actions";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Wallet,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface BalanceIslandProps {
  name: string;
  email: string;
  refreshTrigger?: number;
  onStatsChange?: () => void;
}

export default function BalanceIsland({
  name,
  email,
  refreshTrigger = 0,
  onStatsChange,
}: BalanceIslandProps) {
  const [stats, setStats] = useState<UserBalanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"owed" | "owe" | "pending">("owed");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userStatistics();
      setStats(data);
    } catch (err) {
      toast.error("Failed to load balance statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshTrigger]);

  async function handleApprove(splitId: string) {
    setActionInProgress(splitId);
    try {
      await approveSplit(splitId);
      toast.success("Split approved successfully!");
      await fetchStats();
      onStatsChange?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleReject(splitId: string) {
    setActionInProgress(splitId);
    try {
      await rejectSplit(splitId);
      toast.info("Split request rejected");
      await fetchStats();
      onStatsChange?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setActionInProgress(null);
    }
  }

  if (loading && !stats) {
    return (
      <div
        className={`w-full border border-border bg-background rounded-2xl p-6 shadow-xs ${delius.className} flex flex-col items-center justify-center min-h-[300px] text-muted`}
      >
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-accent" />
        <p className="text-sm">Calculating your balances...</p>
      </div>
    );
  }

  const netBalance = stats?.netBalance || 0;
  const owedTotal = stats?.youAreOwed.total || 0;
  const oweTotal = stats?.youOwe.total || 0;
  const pendingCount = stats?.pendingApprovals.count || 0;

  return (
    <div
      className={`w-full border border-border bg-background flex flex-col gap-4 p-4 sm:p-5 ${delius.className} rounded-2xl shadow-xs`}
    >
      {/* Top Banner: Net Balance */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-accent" />
          <h2 className="font-bold text-lg text-foreground">Your Balance</h2>
        </div>
        <button
          onClick={fetchStats}
          className="p-1.5 rounded-lg border border-border text-muted hover:text-foreground hover:bg-surface transition cursor-pointer"
          title="Refresh balances"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Net Balance Highlight Card */}
      <div
        className={`p-4 rounded-xl border flex flex-col gap-1 transition-all ${
          netBalance > 0
            ? "bg-success/10 border-success/30 text-success-foreground"
            : netBalance < 0
            ? "bg-danger/10 border-danger/30 text-danger-foreground"
            : "bg-surface border-border text-muted"
        }`}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Net Balance
        </span>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {netBalance > 0
              ? `+ ₹${netBalance.toFixed(2)}`
              : netBalance < 0
              ? `- ₹${Math.abs(netBalance).toFixed(2)}`
              : "₹0.00"}
          </span>
          <span className="text-xs sm:text-sm font-medium">
            {netBalance > 0
              ? "You get back"
              : netBalance < 0
              ? "You owe in total"
              : "Settled up"}
          </span>
        </div>
      </div>

      {/* Quick Summary Pills */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("owed")}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeTab === "owed"
              ? "border-success bg-success/5 ring-1 ring-success"
              : "border-border bg-surface hover:border-border/80"
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs text-muted font-medium mb-1">
            <ArrowDownLeft className="w-4 h-4 text-success" />
            <span>You are owed</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-success">
            ₹{owedTotal.toFixed(2)}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("owe")}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeTab === "owe"
              ? "border-danger bg-danger/5 ring-1 ring-danger"
              : "border-border bg-surface hover:border-border/80"
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs text-muted font-medium mb-1">
            <ArrowUpRight className="w-4 h-4 text-danger" />
            <span>You owe</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-danger">
            ₹{oweTotal.toFixed(2)}
          </p>
        </button>
      </div>

      {/* Pending Approvals Notice / Tab Toggle */}
      {pendingCount > 0 && (
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
            activeTab === "pending"
              ? "border-warning bg-warning/15 ring-1 ring-warning"
              : "border-warning/50 bg-warning/10 hover:bg-warning/15"
          }`}
        >
          <div className="flex items-center gap-2 text-warning-foreground text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span>{pendingCount} Pending Approval{pendingCount > 1 ? "s" : ""}</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-warning text-warning-foreground font-bold">
            Action Needed
          </span>
        </button>
      )}

      {/* Active Tab Content */}
      <div className="flex flex-col gap-2 mt-1">
        {activeTab === "owed" && (
          <div>
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
              People who owe you
            </h3>
            {Object.keys(stats?.youAreOwed.byDebtor || {}).length === 0 ? (
              <p className="text-xs text-muted italic p-3 text-center bg-surface rounded-xl border border-dashed border-border">
                No one owes you money right now.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {Object.entries(stats!.youAreOwed.byDebtor).map(
                  ([debtorEmail, data]) => (
                    <div
                      key={debtorEmail}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-surface text-xs sm:text-sm"
                    >
                      <div className="flex flex-col truncate pr-2">
                        <span className="font-semibold text-foreground truncate">
                          {data.name}
                        </span>
                      </div>
                      <span className="font-bold text-success shrink-0">
                        + ₹{data.amount.toFixed(2)}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "owe" && (
          <div>
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
              People you owe
            </h3>
            {Object.keys(stats?.youOwe.byCreditor || {}).length === 0 ? (
              <p className="text-xs text-muted italic p-3 text-center bg-surface rounded-xl border border-dashed border-border">
                You do not owe anyone money right now.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {Object.entries(stats!.youOwe.byCreditor).map(
                  ([creditorEmail, data]) => (
                    <div
                      key={creditorEmail}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-surface text-xs sm:text-sm"
                    >
                      <div className="flex flex-col truncate pr-2">
                        <span className="font-semibold text-foreground truncate">
                          {data.name}
                        </span>
                      </div>
                      <span className="font-bold text-danger shrink-0">
                        - ₹{data.amount.toFixed(2)}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "pending" && (
          <div>
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
              Requires Your Approval
            </h3>
            {stats?.pendingApprovals.items.length === 0 ? (
              <p className="text-xs text-muted italic p-3 text-center bg-surface rounded-xl border border-dashed border-border">
                No pending requests.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {stats?.pendingApprovals.items.map((split) => (
                  <div
                    key={split.id}
                    className="p-3 rounded-xl border border-border bg-surface flex flex-col gap-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-foreground text-sm">
                          {split.description}
                        </p>
                        <p className="text-[11px] text-muted">
                          Group: {split.groupName}
                        </p>
                      </div>
                      <span className="font-bold text-sm text-foreground shrink-0">
                        ₹{split.amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-[11px] text-muted">
                      {split.creditor === email ? (
                        <span>You are listed as the payer (owed money)</span>
                      ) : (
                        <span>
                          {split.creditorName || "Group member"} says you owe them
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/50">
                      <button
                        type="button"
                        disabled={actionInProgress === split.id}
                        onClick={() => handleReject(split.id)}
                        className="px-2.5 py-1 rounded-lg border border-danger/40 text-danger hover:bg-danger/10 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        disabled={actionInProgress === split.id}
                        onClick={() => handleApprove(split.id)}
                        className="px-3 py-1 rounded-lg bg-success text-success-foreground hover:opacity-90 text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}