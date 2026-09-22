const { GoogleGenAI, Type } = require('@google/genai');
const { analyzeHeuristics } = require('./heuristicScanner');
const scanCache = require('../utils/cache');
const logger = require('../utils/logger');

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

    // 1. Check In-Memory SHA-256 Cache for 0ms efficiency
    const cacheKey = scanCache.generateKey(text, file ? file.buffer : null);
    const cachedVerdict = scanCache.get(cacheKey);
    if (cachedVerdict) {
        logger.info("Serving cached threat verdict for identical request", { cacheKey });
        return cachedVerdict;
    }

    // 2. Run instant offline heuristic analysis
    const heuristicResults = analyzeHeuristics(text || '');

    // Read API key dynamically
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

    // If no valid API key is present, return instant heuristic result
    if (!apiKey || apiKey === 'your_actual_gemini_api_key_here' || apiKey.includes('your_gemini_api_key')) {
        const heuristicVerdict = buildHeuristicResponse(heuristicResults);
        scanCache.set(cacheKey, heuristicVerdict);
        return heuristicVerdict;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        // Enforce a strict 3.5-second timeout on Gemini API call
        const apiPromise = ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
                "You are an expert cybersecurity AI. Analyze the following job offer or email for phishing/scam threats. Identify specific red flags.",
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

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("API_TIMEOUT")), 3500);
        });

        const response = await Promise.race([apiPromise, timeoutPromise]);
        const parsed = JSON.parse(response.text);

        // Combine Gemini AI flags with heuristic rules
        const combinedFlags = Array.from(new Set([...(parsed.flags || []), ...heuristicResults.flags]));
        const finalThreatScore = Math.max(parsed.threatScore || 0, heuristicResults.heuristicScore);

        const verdict = {
            threatScore: finalThreatScore,
            flags: combinedFlags,
            summary: parsed.summary || "Threat analysis completed."
        };

        // Cache verdict for future requests
        scanCache.set(cacheKey, verdict);
        return verdict;

    } catch (error) {
        logger.warn("Gemini API call timed out or failed, using heuristic verdict", { error: error.message });
        const fallbackVerdict = buildHeuristicResponse(heuristicResults);
        scanCache.set(cacheKey, fallbackVerdict);
        return fallbackVerdict;
    }
}

/**
 * Builds standard structured threat response from heuristic scanner
 * @param {Object} heuristicResults
 * @returns {{ threatScore: number, flags: string[], summary: string }}
 */
function buildHeuristicResponse(heuristicResults) {
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

module.exports = {
    scanForPhishing
};
