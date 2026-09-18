import { ObjectId } from "mongodb";
import {db} from "@/lib/db";

export type ISplits = {
  _id?: ObjectId;
  creditor: string;
  debtor: string;
  amount: number;
  groupId: ObjectId;
  createdAt: Date;
  createdBy: string;
  description: string;
  status: "APPROVAL_PENDING" | "APPROVED" | "RESOLVED" | "APPROVAL_REJECTED";
}

export const splitsCollection = db.collection<ISplits>("splits");
