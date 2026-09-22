/**
 * Rule-based pre-scanner for fast, offline phishing threat identification.
 * Complements Gemini AI by catching deterministic scam indicators.
 */

const SUSPICIOUS_PATTERNS = [
    {
        pattern: /@(?:gmail|yahoo|hotmail|outlook|protonmail)\.com/i,
        flag: "Official recruiter contact uses a free public email provider (e.g. Gmail/Yahoo) instead of a corporate domain.",
        weight: 25
    },
    {
        pattern: /(?:telegram|whatsapp|signal|hangouts)\s*(?:app|contact|interview|message|chat)/i,
        flag: "Interview or onboarding redirected to informal messaging apps (Telegram, WhatsApp, etc.).",
        weight: 25
    },
    {
        pattern: /(?:buy|purchase|send|wire|deposit)\s*(?:gift\s*card|crypto|bitcoin|equipment|check)/i,
        flag: "Requests for upfront payments, gift card purchases, check deposits, or crypto transfers.",
        weight: 35
    },
    {
        pattern: /(?:urgent|immediately|within 24 hours|account suspended|verify now)/i,
        flag: "High-pressure urgency tactics forcing immediate compliance without verification.",
        weight: 15
    },
    {
        pattern: /(?:no interview required|hired immediately|salary\s*\$?\d{5,}\s*per\s*(?:week|day))/i,
        flag: "Unrealistically high compensation offered without formal interview process.",
        weight: 20
    }
];

/**
 * Runs quick pattern checks against provided text input.
 * @param {string} text 
 * @returns {{ flags: string[], heuristicScore: number }}
 */
function analyzeHeuristics(text) {
    if (!text || typeof text !== 'string') {
        return { flags: [], heuristicScore: 0 };
    }

    const detectedFlags = [];
    let scoreSum = 0;

    for (const item of SUSPICIOUS_PATTERNS) {
        if (item.pattern.test(text)) {
            detectedFlags.push(item.flag);
            scoreSum += item.weight;
        }
    }

    const heuristicScore = Math.min(scoreSum, 100);

    return {
        flags: detectedFlags,
        heuristicScore
    };
}

module.exports = {
    analyzeHeuristics,
    SUSPICIOUS_PATTERNS
};
