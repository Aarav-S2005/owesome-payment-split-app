"use server";

import { ObjectId } from "mongodb";
import {authenticator} from "@/lib/helper/auth.middleware";
import {groupsCollection} from "@/lib/models/groups";
import {usersCollection} from "@/lib/models/users";
import {sendInviteEmail} from "@/lib/helper/email";
import {invitesCollection} from "@/lib/models/invites";

export async function createGroup(groupName: string) {
  const email = await authenticator();
  const result = await groupsCollection.insertOne({
    groupName: groupName,
    members: [email],
  })
  return {
    groupId: result.insertedId
  }
}

export async function inviteMembers(groupID: string, members: string[]) {
  const email = await authenticator();
  const user = await usersCollection.findOne({
    email: email,
  })
  const groupId = new ObjectId(groupID)
  const group = await groupsCollection.findOne({
    _id: groupId
  })
  const inviteDocs = members.map((member) => ({
    groupId,
    invitee: member,
    hasJoined: false,
  }));
  if (inviteDocs.length > 0) {
    await invitesCollection.insertMany(inviteDocs);
  }
  await Promise.all(
    members.map((member) => sendInviteEmail(user?.name!, member, group?.groupName!, groupId))
  );
}

export async function joinGroup(groupId: string){
  const email = await authenticator();
  const id = new ObjectId(groupId)
  const invite = await invitesCollection.findOne({groupId: id, invitee: email})
  if (!invite) {
    throw Error("Not Invited to join this group")
  }
  if (invite.hasJoined){
    throw Error("Already joined")
  }
  await invitesCollection.updateOne({groupId: id, invitee: email}, {hasJoined: true})
  await groupsCollection.updateOne({groupId: id}, {$addToSet: { members: email }})
}

export async function findAllGroups() {
  const email = await authenticator();
  const groups = groupsCollection.find({members: email});
  const g = []
  for await (const group of groups) {
    g.push({groupId: group._id.toString(), groupName: group.groupName, members: group.members})
  }
  return g
}
