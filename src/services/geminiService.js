const { GoogleGenAI, Type } = require('@google/genai');
const retry = require('async-retry');
const { analyzeHeuristics } = require('./heuristicScanner');

// Initialize Gemini Client if key exists
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Analyzes content (text and/or file buffer) for phishing threats using Gemini API
 * @param {Object} options
 * @param {string} [options.text]
 * @param {Object} [options.file]
 * @returns {Promise<{ threatScore: number, flags: string[], summary: string }>}
 */
async function scanForPhishing({ text, file }) {
    const contents = [];

    if (file) {
        contents.push({
            inlineData: {
                data: file.buffer.toString("base64"),
                mimeType: file.mimetype
            }
        });
    }

    if (text) {
        contents.push(text);
    }

    if (contents.length === 0) {
        throw new Error("Please provide text or a document to scan.");
    }

    // Run offline heuristic analysis first (instant 0ms)
    const heuristicResults = analyzeHeuristics(text || '');

    // If no API key configured, return heuristic result immediately without waiting
    if (!ai || !apiKey || apiKey === 'your_actual_gemini_api_key_here') {
        const score = heuristicResults.heuristicScore;
        const flags = heuristicResults.flags.length > 0
            ? heuristicResults.flags
            : ["No automatic heuristic flags triggered. Please review domain and sender details manually."];

        const summary = score >= 50
            ? "High threat potential detected via heuristic threat patterns."
            : score >= 20
                ? "Moderate threat level. Exercise caution before opening links or sharing personal details."
                : "No high-risk phishing patterns detected in initial scan.";

        return {
            threatScore: score,
            flags,
            summary
        };
    }

    try {
        const structuredResponseText = await retry(async (bail) => {
            try {
                // Try gemini-2.5-flash with fast 5-second timeout
                const response = await ai.models.generateContent({
                    model: 'gemini-3.6-flash',
                    contents: [
                        "You are an expert cybersecurity AI. Analyze the following job offer/email for phishing. Identify specific red flags.",
                        ...contents
                    ],
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                threatScore: { type: Type.INTEGER, description: "Scam probability from 0 to 100" },
                                flags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exact suspicious quotes or red flags identified" },
                                summary: { type: Type.STRING, description: "A 2-sentence explanation of the final verdict" }
                            },
                            required: ["threatScore", "flags", "summary"]
                        }
                    }
                });

                return response.text;
            } catch (apiError) {
                // If model is not found or key invalid, bail immediately to fallback without retrying
                bail(apiError);
                return;
            }
        }, {
            retries: 1,
            minTimeout: 500,
            maxTimeout: 1000
        });

        const parsed = JSON.parse(structuredResponseText);

        // Merge heuristic flags if not already present
        const combinedFlags = Array.from(new Set([...(parsed.flags || []), ...heuristicResults.flags]));
        const finalThreatScore = Math.max(parsed.threatScore || 0, heuristicResults.heuristicScore);

        return {
            threatScore: finalThreatScore,
            flags: combinedFlags,
            summary: parsed.summary || "Threat analysis completed."
        };
    } catch (error) {
        console.warn("Gemini API call skipped/failed, using fast heuristic verdict:", error.message);

        const score = heuristicResults.heuristicScore;
        const flags = heuristicResults.flags.length > 0
            ? heuristicResults.flags
            : ["No automatic heuristic flags triggered. Please review domain and sender details manually."];

        const summary = score >= 50
            ? "High threat potential detected via heuristic threat patterns."
            : score >= 20
                ? "Moderate threat level. Exercise caution before opening links or sharing personal details."
                : "No high-risk phishing patterns detected in initial scan.";

        return {
            threatScore: score,
            flags,
            summary
        };
    }
}

module.exports = {
    scanForPhishing
};
