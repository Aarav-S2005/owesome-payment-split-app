import {ObjectId} from "mongodb";
import {db} from "@/lib/db";


export type IInvites = {
  _id?: ObjectId
  invitee: string
  groupId: ObjectId
  hasJoined: boolean
}

export const invitesCollection = db.collection<IInvites>("invites");