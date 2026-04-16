// lib/mongodbClient.js
// ─────────────────────────────────────────────────────────────
// The @auth/mongodb-adapter requires a native MongoClient promise,
// NOT a Mongoose connection. That's because the adapter needs direct
// access to MongoDB collections to manage its own schemas.
//
// We keep this separate from lib/mongodb.js (Mongoose) to avoid
// mixing the two interfaces.
// ─────────────────────────────────────────────────────────────

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development, reuse the MongoClient across hot-reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a fresh client per serverless invocation
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Default export: a Promise<MongoClient>
// This is what MongoDBAdapter expects.
export default clientPromise;
