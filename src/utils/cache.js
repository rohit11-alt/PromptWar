const crypto = require('crypto');

/**
 * In-memory TTL cache to maximize server efficiency and achieve 0ms response latency
 * for identical scan requests.
 */
class ScanCache {
    /**
     * @param {number} [ttlMs=3600000] - Time to live in milliseconds (default 1 hour)
     * @param {number} [maxItems=500] - Maximum cached entries
     */
    constructor(ttlMs = 3600000, maxItems = 500) {
        this.cache = new Map();
        this.ttlMs = ttlMs;
        this.maxItems = maxItems;
    }

    /**
     * Generates a deterministic SHA-256 hash key from input content
     * @param {string} text 
     * @param {Buffer} [fileBuffer] 
     * @returns {string}
     */
    generateKey(text = '', fileBuffer = null) {
        const hash = crypto.createHash('sha256');
        hash.update(text || '');
        if (fileBuffer) {
            hash.update(fileBuffer);
        }
        return hash.digest('hex');
    }

    /**
     * Retrieves cached verdict if available and not expired
     * @param {string} key 
     * @returns {Object|null}
     */
    get(key) {
        if (!this.cache.has(key)) return null;

        const entry = this.cache.get(key);
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Stores verdict in cache with LRU eviction policy
     * @param {string} key 
     * @param {Object} data 
     */
    set(key, data) {
        if (this.cache.size >= this.maxItems) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            data,
            expiresAt: Date.now() + this.ttlMs
        });
    }

    /**
     * Clears all cached items
     */
    clear() {
        this.cache.clear();
    }
}

const scanCache = new ScanCache();

module.exports = scanCache;
