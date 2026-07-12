import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

/**
 * Single place to configure the LLM used across all agent nodes.
 *
 * Using Google Gemini here deliberately: the Gemini API has a genuine,
 * ongoing free tier (no credit card required, no expiration) for the Flash
 * models, unlike most competitors that only offer a one-time trial credit.
 * That makes this project runnable at zero cost.
 *
 * Swapping providers: LangChain.js chat models share a common interface, so
 * swapping to Anthropic/OpenAI/etc. only requires changing this file, e.g.:
 *
 *   import { ChatAnthropic } from "@langchain/anthropic";
 *   export const llm = new ChatAnthropic({ model: "claude-sonnet-4-5-20250929" });
 */
export const llm = new ChatGoogleGenerativeAI({
  model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  temperature: 0.2,
  maxOutputTokens: 2048,
  apiKey: process.env.GEMINI_API_KEY,
});

