"use server";

import { cookies } from 'next/headers';
import bcrypt from "bcryptjs"
import {signJwt} from "@/lib/helper/auth.helper";
import {usersCollection} from "@/lib/models/users";
import {COOKIE_TOKEN_KEY} from "@/lib/helper/auth.helper";
import {authenticator} from "@/lib/helper/auth.middleware";

const HASH_SALT = 12

export async function registerUser(name:string, email: string, password: string) {
  const userExists = await usersCollection.findOne({email: email});
  if(userExists) {
    throw new Error("User already exists");
  }
  const passwordHash = await bcrypt.hash(password, HASH_SALT);

  await usersCollection.insertOne({
    name: name,
    email: email,
    password: passwordHash
  })

  const token = signJwt(email)

  const cookieStore = await cookies()
  cookieStore.set({
    name: COOKIE_TOKEN_KEY,
    value: token,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "strict"
  })
  return
}

export async function loginUser(email: string, password: string) {

  const user = await usersCollection.findOne({email: email});

  if(!user) {
    throw new Error("The email or password does not match");
  }
  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if(!isCorrectPassword) {
    throw new Error("The email or password does not match");
  }

  const token = signJwt(email)

  const cookieStore = await cookies()
  cookieStore.set({
      name: COOKIE_TOKEN_KEY,
      value: token,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict"
  })
  return {
    name: user.name
  }
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_TOKEN_KEY)
}

export async function getUser() {
  const email = await authenticator()
  const user = await usersCollection.findOne({email: email});
  if(!user) {
    await logoutUser()
    throw new Error("Coud Not Find User");
  }
  return {
    name: user.name,
    email: user.email
  }
}