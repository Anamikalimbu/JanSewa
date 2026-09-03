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

  const ai = new GoogleGenAI({ apiKey });

  const contents = turns.map((t) => ({
    role: t.role === "model" ? "model" : "user",
    parts: [{ text: t.text }],
  }));

  let attempt = 0;
  const maxRetries = 2;
  const delays = [500, 1500];

  while (true) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction,
          temperature,
          maxOutputTokens,
        },
      });

      const text = response.text;

      if (!text) {
        throw new Error("Gemini returned no content.");
      }

      return text.trim();
    } catch (err) {
      const isTransient = err.status === 503 || err.status === 429 || 
        (err.message && (err.message.includes("503") || err.message.includes("429") || err.message.includes("UNAVAILABLE") || err.message.includes("overloaded")));

      if (isTransient && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
        attempt++;
        continue;
      }

      console.error("Gemini API Error:", err);
      
      if (isTransient) {
        const wrapped = new Error("The AI assistant is busy right now. Please try again in a moment.");
        wrapped.statusCode = 503;
        wrapped.isOperational = true;
        throw wrapped;
      } else {
        const wrapped = new Error("The AI assistant couldn't respond right now. Please try again.");
        wrapped.statusCode = 502;
        wrapped.isOperational = true;
        throw wrapped;
      }
    }
  }
}

module.exports = { callGemini, GEMINI_MODEL };
