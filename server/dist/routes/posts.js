"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const Post_1 = __importDefault(require("../models/Post"));
const streakService_1 = require("../services/streakService");
const router = (0, express_1.Router)();
// ── Get all posts ─────────────────────────────────────
router.get('/', authMiddleware_1.default, async (req, res) => {
    try {
        const user = req.user;
        const posts = await Post_1.default.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, data: posts });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch posts' });
    }
});
// ── Mark post as used (copied) — increments streak ───
router.patch('/:id/used', authMiddleware_1.default, async (req, res) => {
    try {
        const user = req.user;
        const post = await Post_1.default.findOneAndUpdate({ _id: req.params.id, userId: user._id }, { used: true, usedAt: new Date() }, { new: true });
        if (!post) {
            res.status(404).json({ success: false, error: 'Post not found' });
            return;
        }
        // Increment streak
        await (0, streakService_1.incrementStreak)(user._id.toString());
        res.json({ success: true, data: post });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to mark used' });
    }
});
// ── Rate post (like / dislike) ────────────────────────
router.patch('/:id/rate', authMiddleware_1.default, async (req, res) => {
    try {
        const user = req.user;
        const { rating } = req.body;
        const post = await Post_1.default.findOneAndUpdate({ _id: req.params.id, userId: user._id }, { rating, ratedAt: new Date() }, { new: true });
        res.json({ success: true, data: post });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to rate post' });
    }
});
// ── Submit engagement data ────────────────────────────
router.patch('/:id/engagement', authMiddleware_1.default, async (req, res) => {
    try {
        const user = req.user;
        const { likes, comments, reposts, impressions } = req.body;
        // Validate
        if (likes === undefined || comments === undefined ||
            reposts === undefined || impressions === undefined) {
            res.status(400).json({
                success: false,
                error: 'likes, comments, reposts and impressions are required',
            });
            return;
        }
        // Compute engagement score
        const score = (Number(comments) * 5) +
            (Number(reposts) * 4) +
            (Number(likes) * 1) +
            (Number(impressions) * 0.01);
        const post = await Post_1.default.findOneAndUpdate({ _id: req.params.id, userId: user._id }, {
            engagementData: {
                likes: Number(likes),
                comments: Number(comments),
                reposts: Number(reposts),
                impressions: Number(impressions),
                score: Math.round(score),
                submittedAt: new Date(),
            },
        }, { new: true });
        if (!post) {
            res.status(404).json({ success: false, error: 'Post not found' });
            return;
        }
        res.json({ success: true, data: post, score: Math.round(score) });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to save engagement' });
    }
});
// ── Delete post ───────────────────────────────────────
router.delete('/:id', authMiddleware_1.default, async (req, res) => {
    try {
        const user = req.user;
        await Post_1.default.findOneAndDelete({ _id: req.params.id, userId: user._id });
        res.json({ success: true, message: 'Deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete post' });
    }
});
exports.default = router;
