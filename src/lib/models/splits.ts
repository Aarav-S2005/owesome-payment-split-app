import { ObjectId } from "mongodb";
import {db} from "@/lib/db";

export type ISplits = {
  _id?: ObjectId;
  creditor: string;
  debtor: string;
  amount: number;
  groupID: ObjectId;
  createdAt: Date;
  isResolved: boolean;
  description: string;
  isApproved: boolean;
}

export const splitsCollection = db.collection<ISplits>("splits");
