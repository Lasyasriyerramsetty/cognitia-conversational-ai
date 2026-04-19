const required = (name) => {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v.trim();
};

export const env = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: () => required("MONGODB_URI"),
  groqApiKey: () => required("GROQ_API_KEY"),
  groqModel: process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant",
  frontendOrigin:
    process.env.FRONTEND_URL?.trim() || "http://localhost:5173",
};
