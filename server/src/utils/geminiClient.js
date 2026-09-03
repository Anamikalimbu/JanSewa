/**
 * utils/geminiClient.js
 *
 * Wrapper around Google's Gemini API using the official @google/genai SDK.
 * Used by:
 *   - routes/mapRoutes.js   -> AI hotspot/trend summary of complaints
 *   - routes/chatRoutes.js  -> AI citizen support assistant
 */

const { GoogleGenAI } = require("@google/genai");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

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

  try {
    const client = new GoogleGenAI({ apiKey });
    const contents = turns.map((t) => ({
      role: t.role === "model" ? "model" : "user",
      parts: [{ text: t.text }],
    }));

    const result = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: systemInstruction || undefined,
        temperature,
        maxOutputTokens,
      },
    });
    const text = result.text || result.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("");

    if (!text) {
      const err = new Error("Gemini returned no content.");
      err.statusCode = 502;
      throw err;
    }

    return text.trim();
  } catch (err) {
    if (err.statusCode) throw err;
    const wrapped = new Error(`Gemini error: ${err.message}`);
    wrapped.statusCode = 502;
    throw wrapped;
  }
}

module.exports = { callGemini, GEMINI_MODEL };
