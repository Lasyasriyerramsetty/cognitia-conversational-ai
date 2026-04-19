import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config.js";
import { connectDb } from "./db.js";
import { Interaction } from "./models/Interaction.js";
import { generateAnswer } from "./services/groq.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json({ limit: "64kb" }));

  const allowedOrigins = new Set(
    String(env.frontendOrigin)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );

  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true);
        if (allowedOrigins.has(origin)) return cb(null, true);
        return cb(null, false);
      },
    })
  );

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.post("/ask", limiter, async (req, res) => {
    try {
      const question = req.body?.question;
      if (typeof question !== "string") {
        return res.status(400).json({ error: "question must be a string" });
      }
      const q = question.trim();
      if (!q) {
        return res.status(400).json({ error: "question is required" });
      }
      if (q.length > 4000) {
        return res.status(400).json({ error: "question is too long" });
      }

      await connectDb();

      const answer = await generateAnswer(q);
      await Interaction.create({ question: q, answer });

      return res.json({ answer });
    } catch (e) {
      const status = Number(e?.status) || 500;
      const message =
        status >= 500 ? "Something went wrong. Please try again." : e.message;
      return res.status(status).json({ error: message });
    }
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}
