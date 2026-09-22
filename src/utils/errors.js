/**
 * Custom Error hierarchy for clean separation of application exceptions.
 */

class AppError extends Error {
    /**
     * @param {string} message 
     * @param {number} statusCode 
     */
    constructor(message, statusCode = 500) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    /**
     * @param {string} message 
     */
    constructor(message) {
        super(message, 400);
    }
}

class ScanError extends AppError {
    /**
     * @param {string} message 
     */
    constructor(message) {
        super(message, 500);
    }
}

module.exports = {
    AppError,
    ValidationError,
    ScanError
};
