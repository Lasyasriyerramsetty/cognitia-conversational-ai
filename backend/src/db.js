import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./config.js";

// Windows + Node: `mongodb+srv://` uses DNS SRV lookups that can fail with
// `querySrv ECONNREFUSED` even when `Resolve-DnsName` in PowerShell works.
// Pin resolvers for this Node process only (does not change Windows settings).
dns.setServers(["8.8.8.8", "1.1.1.1"]);

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
