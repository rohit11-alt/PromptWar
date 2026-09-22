/**
 * Structured logger utility for high code quality, readability, and maintainability.
 */

const LOG_LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG'
};

/**
 * Formats and outputs structured log entry
 * @param {string} level 
 * @param {string} message 
 * @param {Object} [meta={}] 
 */
function log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const formattedMeta = Object.keys(meta).length ? JSON.stringify(meta) : '';

    if (level === LOG_LEVELS.ERROR) {
        console.error(`[${timestamp}] [${level}] ${message} ${formattedMeta}`);
    } else if (level === LOG_LEVELS.WARN) {
        console.warn(`[${timestamp}] [${level}] ${message} ${formattedMeta}`);
    } else {
        console.log(`[${timestamp}] [${level}] ${message} ${formattedMeta}`);
    }
}

module.exports = {
    info: (msg, meta) => log(LOG_LEVELS.INFO, msg, meta),
    warn: (msg, meta) => log(LOG_LEVELS.WARN, msg, meta),
    error: (msg, meta) => log(LOG_LEVELS.ERROR, msg, meta),
    debug: (msg, meta) => log(LOG_LEVELS.DEBUG, msg, meta)
};
