import { ObjectId } from "mongodb";
import {db} from "@/lib/db";

export type IGroups = {
  _id?: ObjectId;
  groupName: string;
  members: string[];
}

export const groupsCollection = db.collection<IGroups>("groups");
