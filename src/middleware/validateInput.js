const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_TEXT_LENGTH = 15000; // 15k characters max to prevent payload abuse

/**
 * Validates scan request input (text and file uploads)
 */
function validateScanInput(req, res, next) {
    const text = req.body.text;
    const file = req.file;

    if (!text && !file) {
        return res.status(400).json({
            error: "Please provide text content or a document file to scan."
        });
    }

    if (text && typeof text === 'string' && text.length > MAX_TEXT_LENGTH) {
        return res.status(400).json({
            error: `Text input exceeds maximum limit of ${MAX_TEXT_LENGTH} characters.`
        });
    }

    if (file) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return res.status(400).json({
                error: `Invalid file type '${file.mimetype}'. Allowed formats: PDF, PNG, JPEG, TXT, DOCX.`
            });
        }
    }

    next();
}

module.exports = {
    validateScanInput,
    ALLOWED_MIME_TYPES,
    MAX_TEXT_LENGTH
};
