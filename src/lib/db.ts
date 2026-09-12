import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

if(uri === undefined) {
  throw new Error("MongoDB URI not found");
}

let clientPromise: Promise<MongoClient>;

declare global {
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global.mongoClientPromise) {
  global.mongoClientPromise = new MongoClient(uri).connect();
}

clientPromise = global.mongoClientPromise;

const client = await clientPromise;

export const db = client.db("owesome");

async function ensureIndexes() {
  try {
    await db.collection("invites").createIndex(
      { groupId: 1, invitee: 1 },
      { unique: true }
    );
  } catch (err) {
    console.error("Failed to create index:", err);
  }
}

ensureIndexes();
