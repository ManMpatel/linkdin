"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const Creator_1 = __importDefault(require("../models/Creator"));
const styleExtractor_1 = require("../services/styleExtractor");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});
// ── Get creators for current user ─────────────────────
router.get('/', authMiddleware_1.default, async (req, res) => {
    try {
        const user = req.user;
        const creators = await Creator_1.default.find({ userId: user._id });
        res.json({ success: true, data: creators });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch creators' });
    }
});
// ── Upload screenshots + extract style ────────────────
router.post('/analyse', authMiddleware_1.default, upload.array('screenshots', 20), // max 20 images (10 per creator)
async (req, res) => {
    try {
        const user = req.user;
        const files = req.files;
        // Parse creator data from form
        const creator1Text = req.body.creator1Text ?? '';
        const creator2Text = req.body.creator2Text ?? '';
        // Split files between creators
        // Files named creator1_0, creator1_1 etc OR split by count
        const creator1Files = files.filter((_, i) => i < 10);
        const creator2Files = files.filter((_, i) => i >= 10);
        // Convert to base64
        const toBase64 = (files) => files.map(f => f.buffer.toString('base64'));
        const creators = [];
        if (creator1Files.length > 0 || creator1Text.trim()) {
            creators.push({
                imageBase64: toBase64(creator1Files),
                manualText: creator1Text,
                mimeTypes: creator1Files.map(f => f.mimetype),
            });
        }
        if (creator2Files.length > 0 || creator2Text.trim()) {
            creators.push({
                imageBase64: toBase64(creator2Files),
                manualText: creator2Text,
                mimeTypes: creator2Files.map(f => f.mimetype),
            });
        }
        if (creators.length === 0) {
            res.status(400).json({ success: false, error: 'No creator data provided' });
            return;
        }
        // Extract blended style fingerprint
        const styleFingerprint = await (0, styleExtractor_1.extractStyleFromCreators)(creators);
        // Save to DB — upsert (replace if exists)
        await Creator_1.default.findOneAndUpdate({ userId: user._id }, {
            userId: user._id,
            styleFingerprint,
            extractedAt: new Date(),
        }, { upsert: true, new: true });
        res.json({ success: true, data: styleFingerprint });
    }
    catch (error) {
        console.error('Creator analyse error:', error);
        res.status(500).json({
            success: false,
            error: error.message ?? 'Analysis failed',
        });
    }
});
// ── Delete creator style ──────────────────────────────
router.delete('/', authMiddleware_1.default, async (req, res) => {
    try {
        const user = req.user;
        await Creator_1.default.findOneAndDelete({ userId: user._id });
        res.json({ success: true, message: 'Creator style deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete' });
    }
});
exports.default = router;
