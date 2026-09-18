"use client";

import { useState } from "react";
import { delius } from "@/utils/fonts";
import { createSplit } from "@/lib/actions/splits.actions";
import { GroupMember } from "@/lib/actions/groups.actions";
import { toast } from "sonner";
import { ReceiptText, X, Loader2 } from "lucide-react";

interface AddSplitModalProps {
  isOpen: boolean;
  groupId: string;
  groupName: string;
  members: GroupMember[];
  currentUserEmail: string;
  onClose: () => void;
  onSplitCreated: () => void;
}

export default function AddSplitModal({
  isOpen,
  groupId,
  groupName,
  members,
  currentUserEmail,
  onClose,
  onSplitCreated,
}: AddSplitModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [creditor, setCreditor] = useState<string>(currentUserEmail);
  const [debtor, setDebtor] = useState<string>(
    members.find((m) => m.email !== currentUserEmail)?.email || ""
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    if (!debtor || !creditor) {
      toast.error("Please select both payer and borrower");
      return;
    }

    if (debtor === creditor) {
      toast.error("The person who paid cannot be the same person who owes");
      return;
    }

    setLoading(true);
    try {
      await createSplit(
        groupId,
        debtor,
        creditor,
        parsedAmount,
        description.trim() || "Group Expense"
      );
      toast.success("Expense split added! Pending approval.");
      setDescription("");
      setAmount("");
      onClose();
      onSplitCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create split");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md bg-background border border-border rounded-2xl shadow-xl overflow-hidden ${delius.className}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div className="flex items-center gap-2 text-foreground font-bold text-lg">
            <ReceiptText className="w-5 h-5 text-accent" />
            <span>Add Expense to {groupName}</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground p-1 rounded-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g., Dinner, Groceries, Uber ride"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-field-background text-field-foreground placeholder:text-field-placeholder focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-bold text-sm select-none">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-border bg-field-background text-field-foreground placeholder:text-field-placeholder focus:outline-none focus:ring-2 focus:ring-accent text-sm font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                Who Paid? (Creditor)
              </label>
              <select
                value={creditor}
                onChange={(e) => setCreditor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-field-background text-field-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {members.map((m) => {
                  const isCurrent = m.email === currentUserEmail;
                  const label = isCurrent ? "You" : m.name;
                  return (
                    <option key={m.email} value={m.email}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">
                Who Owes? (Debtor)
              </label>
              <select
                value={debtor}
                onChange={(e) => setDebtor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-field-background text-field-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {members.map((m) => {
                  const isCurrent = m.email === currentUserEmail;
                  const label = isCurrent ? "You" : m.name;
                  return (
                    <option key={m.email} value={m.email}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-xl border border-border text-muted hover:text-foreground transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount || !description.trim()}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-accent text-accent-foreground hover:opacity-95 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ReceiptText className="w-4 h-4" />
              )}
              <span>Add Split</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
