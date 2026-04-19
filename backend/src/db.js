import mongoose from "mongoose";
import { env } from "./config.js";

let cached = globalThis.__mongooseConn;

export async function connectDb() {
  if (cached?.readyState === 1) return cached;
  const uri = env.mongoUri();
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });
  globalThis.__mongooseConn = conn.connection;
  cached = conn.connection;
  return cached;
}
