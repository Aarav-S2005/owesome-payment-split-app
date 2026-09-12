import { ObjectId } from "mongodb";
import {db} from "@/lib/db";

export type IUsers = {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
}

export const usersCollection = db.collection<IUsers>("users");
