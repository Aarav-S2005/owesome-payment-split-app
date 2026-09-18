"use client";

import { useEffect, useState, useCallback } from "react";
import { delius } from "@/utils/fonts";
import { findAllGroups, GroupDTO, GroupMember } from "@/lib/actions/groups.actions";
import {
  getGroupSplits,
  approveSplit,
  rejectSplit,
  resolveSplit,
  deleteSplit,
  SplitDTO,
} from "@/lib/actions/splits.actions";
import { toast } from "sonner";
import CreateGroupModal from "./CreateGroupModal";
import InviteModal from "./InviteModal";
import AddSplitModal from "./AddSplitModal";
import {
  Users,
  Plus,
  UserPlus,
  Receipt,
  CheckCircle,
  XCircle,
  CheckCheck,
  Trash2,
  Clock,
  Loader2,
  Sparkles,
  Inbox,
} from "lucide-react";

interface GroupsIslandProps {
  currentUserEmail: string;
  currentUserName: string;
  onSplitUpdated?: () => void;
  initialGroupId?: string | null;
  refreshTrigger?: number;
}

export default function GroupsIsland({
  currentUserEmail,
  currentUserName,
  onSplitUpdated,
  initialGroupId,
  refreshTrigger = 0,
}: GroupsIslandProps) {
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [splits, setSplits] = useState<SplitDTO[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingSplits, setLoadingSplits] = useState(false);
  const [splitFilter, setSplitFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "RESOLVED">("ALL");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddSplitModalOpen, setIsAddSplitModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Load Groups
  const loadGroups = useCallback(async () => {
    try {
      setLoadingGroups(true);
      const data = await findAllGroups();
      setGroups(data);
      if (data.length > 0) {
        if (initialGroupId && data.some((g) => g.groupId === initialGroupId)) {
          setSelectedGroupId(initialGroupId);
        } else if (!selectedGroupId || !data.some((g) => g.groupId === selectedGroupId)) {
          setSelectedGroupId(data[0].groupId);
        }
      }
    } catch (err) {
      toast.error("Failed to load your groups");
    } finally {
      setLoadingGroups(false);
    }
  }, [initialGroupId, selectedGroupId]);

  // Load Splits for selected group
  const loadSplits = useCallback(async (groupId: string) => {
    try {
      setLoadingSplits(true);
      const data = await getGroupSplits(groupId);
      setSplits(data);
    } catch (err) {
      toast.error("Failed to load group splits");
    } finally {
      setLoadingSplits(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups, refreshTrigger]);

  useEffect(() => {
    if (selectedGroupId) {
      loadSplits(selectedGroupId);
    } else {
      setSplits([]);
    }
  }, [selectedGroupId, loadSplits]);

  // Actions
  async function handleApprove(splitId: string) {
    setActionInProgress(splitId);
    try {
      await approveSplit(splitId);
      toast.success("Split approved!");
      if (selectedGroupId) loadSplits(selectedGroupId);
      onSplitUpdated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve split");
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleReject(splitId: string) {
    setActionInProgress(splitId);
    try {
      await rejectSplit(splitId);
      toast.info("Split rejected");
      if (selectedGroupId) loadSplits(selectedGroupId);
      onSplitUpdated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject split");
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleResolve(splitId: string) {
    setActionInProgress(splitId);
    try {
      await resolveSplit(splitId);
      toast.success("Split marked as settled/resolved!");
      if (selectedGroupId) loadSplits(selectedGroupId);
      onSplitUpdated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resolve split");
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleDelete(splitId: string) {
    if (!confirm("Are you sure you want to delete this split?")) return;
    setActionInProgress(splitId);
    try {
      await deleteSplit(splitId);
      toast.success("Split deleted");
      if (selectedGroupId) loadSplits(selectedGroupId);
      onSplitUpdated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete split");
    } finally {
      setActionInProgress(null);
    }
  }

  const selectedGroup = groups.find((g) => g.groupId === selectedGroupId);

  const filteredSplits = splits.filter((s) => {
    if (splitFilter === "ALL") return true;
    if (splitFilter === "PENDING") return s.status === "APPROVAL_PENDING";
    if (splitFilter === "APPROVED") return s.status === "APPROVED";
    if (splitFilter === "RESOLVED") return s.status === "RESOLVED";
    return true;
  });

  return (
    <div className={`w-full flex flex-col gap-4 ${delius.className}`}>
      {/* Top Group Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-background border border-border p-3 sm:p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted uppercase tracking-wider shrink-0 pr-1">
            <Users className="w-4 h-4 text-accent" />
            <span>Groups:</span>
          </div>

          {loadingGroups ? (
            <div className="flex items-center gap-2 text-xs text-muted">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
              <span>Loading...</span>
            </div>
          ) : groups.length === 0 ? (
            <span className="text-xs text-muted italic">No groups yet</span>
          ) : (
            groups.map((group) => {
              const isSelected = group.groupId === selectedGroupId;
              return (
                <button
                  key={group.groupId}
                  onClick={() => setSelectedGroupId(group.groupId)}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-accent text-accent-foreground shadow-xs"
                      : "bg-surface text-foreground border border-border hover:bg-surface-secondary"
                  }`}
                >
                  {group.groupName}
                </button>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-default text-default-foreground hover:opacity-90 text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Group</span>
        </button>
      </div>

      {/* Main Group Content Area */}
      {!selectedGroup ? (
        <div className="bg-background border border-border rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-2">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            No Groups Selected
          </h3>
          <p className="text-sm text-muted max-w-sm">
            Create a new group or choose an existing one from the top bar to start tracking and splitting expenses.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-95 transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Group</span>
          </button>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-2xl p-4 sm:p-6 flex flex-col gap-5 shadow-xs">
          {/* Group Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {selectedGroup.groupName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted mt-1 flex-wrap">
                <span>{selectedGroup.members.length} members:</span>
                {selectedGroup.members.map((m) => (
                  <span
                    key={m.email}
                    className="px-2 py-0.5 rounded-md bg-surface border border-border text-[11px] text-foreground font-medium"
                  >
                    {m.email === currentUserEmail ? "You" : m.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-border bg-surface text-foreground hover:bg-surface-secondary text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-accent" />
                <span>Invite</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddSplitModalOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-accent text-accent-foreground hover:opacity-95 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>

          {/* Splits Filter & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-accent" />
              <h3 className="font-bold text-base text-foreground">
                Group Expenses ({splits.length})
              </h3>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(["ALL", "PENDING", "APPROVED", "RESOLVED"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSplitFilter(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                    splitFilter === tab
                      ? "bg-foreground text-background"
                      : "bg-surface text-muted hover:text-foreground border border-border"
                  }`}
                >
                  {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Splits List */}
          {loadingSplits ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
              <p className="text-xs">Loading expenses...</p>
            </div>
          ) : filteredSplits.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-2 bg-surface rounded-xl border border-dashed border-border p-6">
              <Inbox className="w-8 h-8 text-muted" />
              <p className="text-sm font-semibold text-foreground">
                No {splitFilter !== "ALL" ? splitFilter.toLowerCase() : ""} expenses yet
              </p>
              <p className="text-xs text-muted max-w-xs">
                Tap "+ Add Expense" to record a shared bill or split with group members.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredSplits.map((split) => {
                const isCreditor = split.creditor === currentUserEmail;
                const isDebtor = split.debtor === currentUserEmail;
                const isPending = split.status === "APPROVAL_PENDING";
                const isApproved = split.status === "APPROVED";
                const isResolved = split.status === "RESOLVED";
                const isRejected = split.status === "APPROVAL_REJECTED";
                const canApproveOrReject = isPending && split.createdBy !== currentUserEmail && (isDebtor || isCreditor);
                const canResolve = isApproved && isCreditor;
                const canDelete = split.createdBy === currentUserEmail || isDebtor || isCreditor;

                return (
                  <div
                    key={split.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isResolved
                        ? "bg-surface/50 border-border/60 opacity-80"
                        : isRejected
                        ? "bg-danger/5 border-danger/20 opacity-70"
                        : isPending
                        ? "bg-warning/5 border-warning/30"
                        : "bg-surface border-border hover:border-border/80"
                    }`}
                  >
                    {/* Left details */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-sm sm:text-base">
                          {split.description}
                        </span>

                        {/* Status Badges */}
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/20 text-warning-foreground border border-warning/30 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending Approval
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/20 text-success-foreground border border-success/30 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-success" />
                            Approved
                          </span>
                        )}
                        {isResolved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted/20 text-muted border border-border flex items-center gap-1">
                            <CheckCheck className="w-3 h-3 text-success" />
                            Settled
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger/20 text-danger-foreground border border-danger/30 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-danger" />
                            Rejected
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted">
                        <strong className="text-foreground font-semibold">
                          {isCreditor ? "You" : split.creditorName || "Group member"}
                        </strong>{" "}
                        paid for{" "}
                        <strong className="text-foreground font-semibold">
                          {isDebtor ? "You" : split.debtorName || "Group member"}
                        </strong>{" "}
                        • {new Date(split.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Right side: Amount and Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      <div className="text-left sm:text-right">
                        <div
                          className={`text-lg font-extrabold ${
                            isCreditor
                              ? "text-success"
                              : isDebtor
                              ? "text-danger"
                              : "text-foreground"
                          }`}
                        >
                          {isCreditor ? `+ ₹${split.amount.toFixed(2)}` : isDebtor ? `- ₹${split.amount.toFixed(2)}` : `₹${split.amount.toFixed(2)}`}
                        </div>
                        <span className="text-[10px] text-muted">
                          {isCreditor ? "You are owed" : isDebtor ? "You owe" : "Split total"}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {canApproveOrReject && (
                          <>
                            <button
                              type="button"
                              disabled={actionInProgress === split.id}
                              onClick={() => handleReject(split.id)}
                              className="p-1.5 rounded-lg border border-danger/40 text-danger hover:bg-danger/10 transition cursor-pointer"
                              title="Reject Split"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={actionInProgress === split.id}
                              onClick={() => handleApprove(split.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-success text-success-foreground text-xs font-bold hover:opacity-90 transition flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          </>
                        )}

                        {canResolve && (
                          <button
                            type="button"
                            disabled={actionInProgress === split.id}
                            onClick={() => handleResolve(split.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-success text-success-foreground text-xs font-bold hover:opacity-90 transition flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Mark as paid / settled"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Mark Settled</span>
                          </button>
                        )}

                        {canDelete && (
                          <button
                            type="button"
                            disabled={actionInProgress === split.id}
                            onClick={() => handleDelete(split.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition cursor-pointer"
                            title="Delete split"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={(newGroupId) => {
          loadGroups();
          setSelectedGroupId(newGroupId);
        }}
      />

      {selectedGroup && (
        <>
          <InviteModal
            isOpen={isInviteModalOpen}
            groupId={selectedGroup.groupId}
            groupName={selectedGroup.groupName}
            onClose={() => setIsInviteModalOpen(false)}
            onInvited={() => loadGroups()}
          />

          <AddSplitModal
            isOpen={isAddSplitModalOpen}
            groupId={selectedGroup.groupId}
            groupName={selectedGroup.groupName}
            members={selectedGroup.members}
            currentUserEmail={currentUserEmail}
            onClose={() => setIsAddSplitModalOpen(false)}
            onSplitCreated={() => {
              loadSplits(selectedGroup.groupId);
              onSplitUpdated?.();
            }}
          />
        </>
      )}
    </div>
  );
}