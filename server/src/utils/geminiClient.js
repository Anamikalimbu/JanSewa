/**
 * utils/geminiClient.js
 *
 * Thin wrapper around Google's Gemini REST API (generateContent).
 * Used by:
 *   - routes/mapRoutes.js   -> AI hotspot/trend summary of complaints
 *   - routes/chatRoutes.js  -> AI citizen support assistant
 *
 * No SDK dependency required — plain fetch against the public
 * Generative Language API, so it works with just a GEMINI_API_KEY
 * in the .env file.
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Calls Gemini with a system instruction + conversation turns and
 * returns the plain text reply.
 *
 * @param {Object} opts
 * @param {string} opts.systemInstruction - Sets the assistant's role/behaviour.
 * @param {Array<{role: "user"|"model", text: string}>} opts.turns - Conversation history, oldest first.
 * @param {number} [opts.temperature=0.4]
 * @param {number} [opts.maxOutputTokens=800]
 * @returns {Promise<string>}
 */
async function callGemini({ systemInstruction, turns, temperature = 0.4, maxOutputTokens = 800 }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const err = new Error(
      "GEMINI_API_KEY is not configured. Add it to server/.env to enable AI features."
    );
    err.statusCode = 503;
    err.isAiConfigError = true;
    throw err;
  }

  const body = {
    contents: turns.map((turn) => ({
      role: turn.role === "model" ? "model" : "user",
      parts: [{ text: turn.text }],
    })),
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    const err = new Error(`Gemini API error (${response.status}): ${errText.slice(0, 300)}`);
    err.statusCode = 502;
    throw err;
  }

  const data = await response.json();

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";

  if (!text) {
    const finishReason = data?.candidates?.[0]?.finishReason;
    const err = new Error(`Gemini returned no content${finishReason ? ` (${finishReason})` : ""}.`);
    err.statusCode = 502;
    throw err;
  }

  return text.trim();
}

module.exports = { callGemini, GEMINI_MODEL };
