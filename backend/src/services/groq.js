import { env } from "../config.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function generateAnswer(question) {
  const apiKey = env.groqApiKey();
  const model = env.groqModel;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: question }],
      temperature: 0.6,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      data?.message ||
      `Groq request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status >= 400 && res.status < 600 ? res.status : 502;
    throw err;
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text || typeof text !== "string") {
    const err = new Error("Unexpected Groq response shape");
    err.status = 502;
    throw err;
  }

  return text.trim();
}
