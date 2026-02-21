import { MongoClient } from "mongodb";

let db;

export async function connectDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db("graphquestDB");
  console.log("Connected to MongoDB");
}

export function getDB() {
  if (!db) throw new Error("DB not connected");
  return db;
}
