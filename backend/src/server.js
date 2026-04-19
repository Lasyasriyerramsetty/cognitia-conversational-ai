import "dotenv/config";
import { createApp } from "./app.js";
import { env } from "./config.js";
import { connectDb } from "./db.js";

const app = createApp();

await connectDb().catch((err) => {
  console.error("MongoDB connection failed:", err?.message || err);
  process.exit(1);
});

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});
