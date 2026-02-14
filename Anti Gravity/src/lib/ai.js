/**
 * AI Icebreaker Service
 *
 * Generates a one-sentence icebreaker based on the beacon activity and category.
 * Uses the Gemini API if VITE_GEMINI_API_KEY is set, otherwise falls back to
 * activity-aware local templates.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Activity-aware fallback icebreakers by category.
 * Each template directly references the activity so they're never generic.
 */
const fallbacks = {
    Study: (activity) =>
        `✨ Welcome! Ask the group what part of "${activity}" they're tackling — teamwork makes it click!`,
    Food: (activity) =>
        `✨ Welcome! Ask everyone what they're ordering — "${activity}" is better with recommendations!`,
    Sports: (activity) =>
        `✨ Welcome! Ask who's winning or if they need one more for "${activity}"!`,
    Chill: (activity) =>
        `✨ Welcome! Just say hi — "${activity}" is all about good vibes and new friends!`,
    Research: (activity) =>
        `✨ Welcome! Ask what papers or datasets everyone is using for "${activity}"!`,
    Coding: (activity) =>
        `✨ Welcome! Ask what tech stack everyone is using for "${activity}" — great way to learn!`,
    Gaming: (activity) =>
        `✨ Welcome! Ask if anyone needs a teammate for "${activity}" — let's go!`,
    Events: (activity) =>
        `✨ Welcome! Ask what's coming up next at "${activity}" — don't miss anything!`,
};

/**
 * Generate an AI icebreaker for a beacon.
 * The activity title is the PRIMARY context — the tip must be directly
 * relevant to what the activity describes, not generic category advice.
 *
 * @param {string} activity - The beacon activity name (e.g. "Building a robotic arm")
 * @param {string} category - The beacon category (Study, Food, Sports, Chill)
 * @returns {Promise<string>} The icebreaker message
 */
export async function generateIcebreaker(activity, category) {
    // If no API key, use smart fallback
    if (!GEMINI_API_KEY) {
        const fn = fallbacks[category] || fallbacks.Chill;
        return fn(activity);
    }

    try {
        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [
                        {
                            text: `You are a helpful college campus assistant for an app called JoinIn. Your job is to generate a one-sentence icebreaker tip when a student joins a live activity session.

CRITICAL RULES:
- Your tip must be STRICTLY about the specific activity title provided. The activity title is the most important input.
- Do NOT give generic category advice. If the activity is "Building a robotic arm", talk about robotics, servos, or hardware — NOT about lab manuals or textbooks.
- If the activity is "Calculus Exam Prep", talk about calculus — NOT generic study tips.
- The category is only for tone (Study = focused, Food = casual, Sports = energetic, Chill = relaxed). The CONTENT must come from the activity title.
- One sentence only, under 25 words.
- Start with a ✨ emoji.
- Be warm, casual, and fun.
- Do NOT wrap your response in quotes.`,
                        },
                    ],
                },
                contents: [
                    {
                        parts: [
                            {
                                text: `Activity: "${activity}"\nCategory: ${category}\n\nGenerate one icebreaker sentence specifically about "${activity}":`,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 60,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (text) return text;

        // If API returned empty, use fallback
        throw new Error("Empty response");
    } catch (error) {
        console.warn("AI icebreaker failed, using fallback:", error.message);
        const fn = fallbacks[category] || fallbacks.Chill;
        return fn(activity);
    }
}
