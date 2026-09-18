"use client";

import { useState } from "react";
import { delius } from "@/utils/fonts";
import { createGroup } from "@/lib/actions/groups.actions";
import { toast } from "sonner";
import { Plus, X, Users, Loader2 } from "lucide-react";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (groupId: string) => void;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onGroupCreated,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const result = await createGroup(groupName.trim());
      toast.success(`Group "${groupName}" created!`);
      setGroupName("");
      onClose();
      onGroupCreated(result.groupId.toString());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create group");
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
            <Users className="w-5 h-5 text-accent" />
            <span>Create New Group</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Group Name
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g., Goa Trip, Flat 402, Dinner Outing"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-field-background text-field-foreground placeholder:text-field-placeholder focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              required
            />
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
              disabled={loading || !groupName.trim()}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-accent text-accent-foreground hover:opacity-95 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Create Group</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
