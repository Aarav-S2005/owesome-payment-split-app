"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { signJwt } from "@/lib/helper/auth.helper";
import { usersCollection } from "@/lib/models/users";
import { groupsCollection } from "@/lib/models/groups";
import { invitesCollection } from "@/lib/models/invites";
import { COOKIE_TOKEN_KEY } from "@/lib/helper/auth.helper";
import { authenticator } from "@/lib/helper/auth.middleware";

const HASH_SALT = 12;

export async function registerUser(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const userExists = await usersCollection.findOne({ email: normalizedEmail });
  if (userExists) {
    throw new Error("User already exists");
  }
  const passwordHash = await bcrypt.hash(password, HASH_SALT);

  await usersCollection.insertOne({
    name: name.trim(),
    email: normalizedEmail,
    password: passwordHash,
  });

  try {
    const pendingInvites = await invitesCollection.find({ invitee: normalizedEmail, hasJoined: false, }).toArray();

    if (pendingInvites.length > 0) {
      const groupObjectIds = pendingInvites.map((inv) => inv.groupId);
      await groupsCollection.updateMany(
        { _id: { $in: groupObjectIds } },
        { $addToSet: { members: normalizedEmail } }
      );
      await invitesCollection.updateMany(
        { invitee: normalizedEmail },
        { $set: { hasJoined: true } }
      );
    }
  } catch (err) {
    console.error("Error auto-joining pending invites upon registration:", err);
  }

  const token = signJwt(normalizedEmail);

  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_TOKEN_KEY,
    value: token,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "strict",
  });
  return;
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await usersCollection.findOne({ email: normalizedEmail });

  if (!user) {
    throw new Error("The email or password does not match");
  }
  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) {
    throw new Error("The email or password does not match");
  }

  try {
    const pendingInvites = await invitesCollection.find({ invitee: normalizedEmail, hasJoined: false, }).toArray();

    if (pendingInvites.length > 0) {
      const groupObjectIds = pendingInvites.map((inv) => inv.groupId);
      await groupsCollection.updateMany(
        { _id: { $in: groupObjectIds } },
        { $addToSet: { members: normalizedEmail } }
      );
      await invitesCollection.updateMany(
        { invitee: normalizedEmail },
        { $set: { hasJoined: true } }
      );
    }
  } catch (err) {
    console.error("Error auto-joining pending invites upon login:", err);
  }

  const token = signJwt(normalizedEmail);

  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_TOKEN_KEY,
    value: token,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "strict",
  });
  return {
    name: user.name,
  };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_TOKEN_KEY);
}

export async function getUser() {
  const email = await authenticator();
  const normalizedEmail = email.trim().toLowerCase();
  const user = await usersCollection.findOne({ email: normalizedEmail });
  if (!user) {
    await logoutUser();
    throw new Error("Could not find user");
  }
  return {
    name: user.name,
    email: user.email,
  };
}