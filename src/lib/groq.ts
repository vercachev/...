const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

function parseJsonResponse<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Failed to parse AI response");
    return JSON.parse(match[0]) as T;
  }
}

export async function generateJson<T>(prompt: string): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || `Groq error ${res.status}`;
    throw new Error(msg);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty Groq response");

  return parseJsonResponse<T>(text);
}
