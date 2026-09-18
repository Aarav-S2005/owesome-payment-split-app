"use server";

import { ObjectId } from "mongodb";
import { authenticator } from "@/lib/helper/auth.middleware";
import { splitsCollection, ISplits } from "@/lib/models/splits";
import { groupsCollection } from "@/lib/models/groups";
import { usersCollection } from "@/lib/models/users";

export type SplitDTO = {
  id: string;
  debtor: string;
  debtorName?: string;
  creditor: string;
  creditorName?: string;
  amount: number;
  groupId: string;
  groupName?: string;
  createdAt: string;
  createdBy: string;
  description: string;
  status: "APPROVAL_PENDING" | "APPROVED" | "RESOLVED" | "APPROVAL_REJECTED";
};

export type UserBalanceSummary = {
  youAreOwed: {
    total: number;
    items: SplitDTO[];
    byDebtor: Record<string, { name: string; amount: number }>;
  };
  youOwe: {
    total: number;
    items: SplitDTO[];
    byCreditor: Record<string, { name: string; amount: number }>;
  };
  netBalance: number;
  pendingApprovals: {
    count: number;
    items: SplitDTO[];
  };
};

export async function createSplit(groupId: string, debtor: string, creditor: string, amount: number, description: string) {
  const email = await authenticator();
  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }
  if (!debtor || !creditor || debtor === creditor) {
    throw new Error("Debtor and Creditor must be specified and different");
  }
  const groupObjectId = new ObjectId(groupId);
  const group = await groupsCollection.findOne({ _id: groupObjectId });
  if (!group) {
    throw new Error("Group not found");
  }
  if (!group.members.includes(email)) {
    throw new Error("You are not a member of this group");
  }
  if (!group.members.includes(debtor) || !group.members.includes(creditor)) {
    throw new Error("Both debtor and creditor must belong to this group");
  }

  const result = await splitsCollection.insertOne({ debtor, creditor, amount, groupId: groupObjectId, createdAt: new Date(), createdBy: email, description: description?.trim() || "Split Expense", status: "APPROVAL_PENDING" });

  return { success: true, splitId: result.insertedId.toString() };
}

export async function userStatistics(): Promise<UserBalanceSummary> {
  const email = await authenticator();
  const splits = await splitsCollection.find({ $or: [{ debtor: email }, { creditor: email }] }).sort({ createdAt: -1 }).toArray();

  const groupIds = Array.from(new Set(splits.map((s) => s.groupId.toString()))).map((id) => new ObjectId(id));
  const groups = await groupsCollection.find({ _id: { $in: groupIds } }).toArray();
  const groupMap = new Map<string, string>(groups.map((g) => [g._id.toString(), g.groupName]));

  const participantEmails = Array.from(new Set(splits.flatMap((s) => [s.debtor, s.creditor])));
  const users = await usersCollection.find({ email: { $in: participantEmails } }).toArray();
  const userMap = new Map<string, string>(users.map((u) => [u.email, u.name || u.email]));

  const stats: UserBalanceSummary = {
    youAreOwed: {
      total: 0,
      items: [],
      byDebtor: {},
    },
    youOwe: {
      total: 0,
      items: [],
      byCreditor: {},
    },
    netBalance: 0,
    pendingApprovals: {
      count: 0,
      items: [],
    }
  };

  for (const split of splits) {
    const splitDTO: SplitDTO = {
      id: split._id?.toString() || "",
      debtor: split.debtor,
      debtorName: userMap.get(split.debtor) || split.debtor,
      creditor: split.creditor,
      creditorName: userMap.get(split.creditor) || split.creditor,
      amount: split.amount,
      groupId: split.groupId.toString(),
      groupName: groupMap.get(split.groupId.toString()) || "Unknown Group",
      createdAt: split.createdAt.toISOString(),
      createdBy: split.createdBy,
      description: split.description,
      status: split.status,
    };
    if (split.status === "APPROVAL_PENDING" && split.createdBy !== email) {
      stats.pendingApprovals.items.push(splitDTO);
    }
    if (split.status !== "RESOLVED" && split.status !== "APPROVAL_REJECTED") {
      if (split.creditor === email) {
        stats.youAreOwed.total += split.amount;
        stats.youAreOwed.items.push(splitDTO);

        const debtorKey = split.debtor;
        if (!stats.youAreOwed.byDebtor[debtorKey]) {
          stats.youAreOwed.byDebtor[debtorKey] = {
            name: userMap.get(debtorKey) || debtorKey,
            amount: 0,
          };
        }
        stats.youAreOwed.byDebtor[debtorKey].amount += split.amount;
      } else if (split.debtor === email) {
        stats.youOwe.total += split.amount;
        stats.youOwe.items.push(splitDTO);

        const creditorKey = split.creditor;
        if (!stats.youOwe.byCreditor[creditorKey]) {
          stats.youOwe.byCreditor[creditorKey] = {
            name: userMap.get(creditorKey) || creditorKey,
            amount: 0,
          };
        }
        stats.youOwe.byCreditor[creditorKey].amount += split.amount;
      }
    }
  }
  stats.pendingApprovals.count = stats.pendingApprovals.items.length;
  stats.netBalance = stats.youAreOwed.total - stats.youOwe.total;

  return stats;
}

export async function getGroupSplits(groupId: string): Promise<SplitDTO[]> {
  const email = await authenticator();
  const groupObjectId = new ObjectId(groupId);

  const group = await groupsCollection.findOne({_id: groupObjectId, members: email});

  if (!group) {
    throw new Error("Group not found or access denied");
  }

  const splits = await splitsCollection.find({ groupId: groupObjectId }).sort({ createdAt: -1 }).toArray();

  const participantEmails = Array.from(new Set(splits.flatMap((s) => [s.debtor, s.creditor])));
  const users = await usersCollection.find({ email: { $in: participantEmails } }).toArray();
  const userMap = new Map<string, string>(users.map((u) => [u.email, u.name || u.email]));

  return splits.map((s) => ({
    id: s._id?.toString() || "",
    debtor: s.debtor,
    debtorName: userMap.get(s.debtor) || s.debtor,
    creditor: s.creditor,
    creditorName: userMap.get(s.creditor) || s.creditor,
    amount: s.amount,
    groupId: s.groupId.toString(),
    groupName: group.groupName,
    createdAt: s.createdAt.toISOString(),
    createdBy: s.createdBy,
    description: s.description,
    status: s.status,
  }));
}

export async function approveSplit(splitId: string) {
  const email = await authenticator();
  const splitObjectId = new ObjectId(splitId);

  const split = await splitsCollection.findOne({ _id: splitObjectId });
  if (!split) {
    throw new Error("Split not found");
  }

  if (split.status !== "APPROVAL_PENDING") {
    throw new Error("Split is not pending approval");
  }
  if (split.debtor !== email && split.creditor !== email) {
    throw new Error("Unauthorized to approve this split");
  }

  if (split.createdBy === email) {
    throw new Error("Creator cannot approve their own split creation");
  }

  await splitsCollection.updateOne(
    { _id: splitObjectId },
    { $set: { status: "APPROVED" } }
  );

  return { success: true };
}

export async function rejectSplit(splitId: string) {
  const email = await authenticator();
  const splitObjectId = new ObjectId(splitId);

  const split = await splitsCollection.findOne({ _id: splitObjectId });
  if (!split) {
    throw new Error("Split not found");
  }

  if (split.status !== "APPROVAL_PENDING") {
    throw new Error("Split is not pending approval");
  }

  if (split.debtor !== email && split.creditor !== email) {
    throw new Error("Unauthorized to reject this split");
  }

  if (split.createdBy === email) {
    throw new Error("Creator cannot reject approval, use delete instead");
  }

  await splitsCollection.updateOne(
    { _id: splitObjectId },
    { $set: { status: "APPROVAL_REJECTED" } }
  );

  return { success: true };
}

export async function resolveSplit(splitId: string) {
  const email = await authenticator();
  const splitObjectId = new ObjectId(splitId);

  const split = await splitsCollection.findOne({ _id: splitObjectId });
  if (!split) {
    throw new Error("Split not found");
  }

  if (split.creditor !== email) {
    throw new Error("Only the creditor can mark this split as resolved");
  }

  await splitsCollection.updateOne(
    { _id: splitObjectId },
    { $set: { status: "RESOLVED" } }
  );

  return { success: true };
}

export async function deleteSplit(splitId: string) {
  const email = await authenticator();
  const splitObjectId = new ObjectId(splitId);

  const split = await splitsCollection.findOne({ _id: splitObjectId });
  if (!split) {
    throw new Error("Split not found");
  }

  if (
    split.createdBy !== email &&
    split.debtor !== email &&
    split.creditor !== email
  ) {
    throw new Error("Unauthorized to delete this split");
  }

  await splitsCollection.deleteOne({ _id: splitObjectId });

  return { success: true };
}
