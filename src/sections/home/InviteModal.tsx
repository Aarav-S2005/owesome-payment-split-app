"use client";

import { useState } from "react";
import { delius } from "@/utils/fonts";
import { inviteMembers } from "@/lib/actions/groups.actions";
import { toast } from "sonner";
import { UserPlus, X, Mail, Loader2, Plus } from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  groupId: string;
  groupName: string;
  onClose: () => void;
  onInvited: () => void;
}

export default function InviteModal({
  isOpen,
  groupId,
  groupName,
  onClose,
  onInvited,
}: InviteModalProps) {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function handleAddEmail() {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (emails.includes(trimmed)) {
      toast.info("Email already added to the invite list");
      return;
    }
    setEmails([...emails, trimmed]);
    setEmailInput("");
  }

  function handleRemoveEmail(target: string) {
    setEmails(emails.filter((e) => e !== target));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let finalEmails = [...emails];
    if (emailInput.trim()) {
      const trimmed = emailInput.trim().toLowerCase();
      if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmed) && !finalEmails.includes(trimmed)) {
        finalEmails.push(trimmed);
      }
    }

    if (finalEmails.length === 0) {
      toast.error("Add at least one email address to send invites");
      return;
    }

    setLoading(true);
    try {
      await inviteMembers(groupId, finalEmails);
      toast.success(`Sent invitation(s) for "${groupName}"`);
      setEmails([]);
      setEmailInput("");
      onClose();
      onInvited();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invitations");
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
            <UserPlus className="w-5 h-5 text-accent" />
            <span>Invite to {groupName}</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">
              Member Email Address
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="friend@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-field-background text-field-foreground placeholder:text-field-placeholder focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleAddEmail}
                className="px-3.5 py-2 rounded-xl bg-default text-default-foreground hover:opacity-90 font-medium text-sm flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-surface rounded-xl border border-border">
              {emails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-field-background border border-border rounded-lg text-xs text-foreground"
                >
                  <Mail className="w-3 h-3 text-muted" />
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(email)}
                    className="text-muted hover:text-danger ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

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
              disabled={loading || (emails.length === 0 && !emailInput.trim())}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-accent text-accent-foreground hover:opacity-95 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>Send Invites</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
