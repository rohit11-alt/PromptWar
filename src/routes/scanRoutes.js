const express = require('express');
const multer = require('multer');
const { validateScanInput } = require('../middleware/validateInput');
const { scanForPhishing } = require('../services/geminiService');

const router = express.Router();

// Multer memory storage configuration (5MB limit)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

/**
 * GET /api/health - System health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: "ok",
        service: "PhishGuard AI",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * POST /api/scan-offer - Core scanning endpoint for text and file attachments
 */
router.post('/scan-offer', upload.single('document'), validateScanInput, async (req, res) => {
    try {
        const text = req.body.text;
        const file = req.file;

        const result = await scanForPhishing({ text, file });
        return res.json(result);
    } catch (error) {
        console.error("Error in /api/scan-offer route:", error);
        return res.status(500).json({
            error: "Service temporarily unavailable due to high demand. Please try again later."
        });
    }
});

module.exports = router;
