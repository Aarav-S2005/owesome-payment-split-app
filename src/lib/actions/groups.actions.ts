"use server";

import { ObjectId } from "mongodb";
import { authenticator } from "@/lib/helper/auth.middleware";
import { groupsCollection } from "@/lib/models/groups";
import { usersCollection } from "@/lib/models/users";
import { sendInviteEmail } from "@/lib/helper/email";
import { invitesCollection } from "@/lib/models/invites";

export type GroupMember = {
  email: string;
  name: string;
};

export type GroupDTO = {
  groupId: string;
  groupName: string;
  memberEmails: string[];
  members: GroupMember[];
};

export async function createGroup(groupName: string) {
  const email = await authenticator();
  const normalizedEmail = email.trim().toLowerCase();
  const result = await groupsCollection.insertOne({
    groupName: groupName,
    members: [normalizedEmail],
  });
  return {
    groupId: result.insertedId.toString(),
  };
}

export async function inviteMembers(groupID: string, members: string[]) {
  const email = await authenticator();
  const normalizedEmail = email.trim().toLowerCase();
  const user = await usersCollection.findOne({
    email: normalizedEmail,
  });
  const groupId = new ObjectId(groupID);
  const group = await groupsCollection.findOne({
    _id: groupId,
  });

  if (!group) {
    throw new Error("Group not found");
  }

  await Promise.all(
    members.map((member) =>
      invitesCollection.updateOne(
        { groupId: groupId, invitee: member.trim().toLowerCase() },
        {
          $set: {
            groupId: groupId,
            invitee: member.trim().toLowerCase(),
            hasJoined: false,
          },
        },
        { upsert: true }
      )
    )
  );

  await Promise.all(
    members.map((member) => sendInviteEmail(user?.name || email, member.trim().toLowerCase(), group.groupName, groupId))
  );
}

export async function joinGroup(groupId: string) {
  const email = await authenticator();
  const normalizedEmail = email.trim().toLowerCase();
  const id = new ObjectId(groupId);

  const group = await groupsCollection.findOne({ _id: id });
  if (!group) {
    throw new Error("Group not found");
  }

  if (group.members.includes(normalizedEmail)) {
    return { success: true, message: "Already joined" };
  }

  const invite = await invitesCollection.findOne({
    groupId: id,
    invitee: normalizedEmail,
  });

  if (!invite) {
    throw new Error("Not invited to join this group");
  }

  await invitesCollection.updateOne(
    { groupId: id, invitee: normalizedEmail },
    { $set: { hasJoined: true } }
  );

  await groupsCollection.updateOne(
    { _id: id },
    { $addToSet: { members: normalizedEmail } }
  );

  return { success: true };
}

export async function findAllGroups(): Promise<GroupDTO[]> {
  const email = await authenticator();
  const normalizedEmail = email.trim().toLowerCase();
  const groups = await groupsCollection.find({ members: normalizedEmail }).toArray();

  const allMemberEmails = Array.from(new Set(groups.flatMap((g) => g.members)));
  const users = await usersCollection
    .find({ email: { $in: allMemberEmails } })
    .toArray();
  const userMap = new Map<string, string>(
    users.map((u) => [u.email, u.name || u.email])
  );

  return groups.map((group) => ({
    groupId: group._id.toString(),
    groupName: group.groupName,
    memberEmails: group.members,
    members: group.members.map((m) => ({
      email: m,
      name: userMap.get(m) || m,
    })),
  }));
}
