"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const User_1 = __importDefault(require("../models/User"));
const regionConfig_1 = require("../config/regionConfig");
const router = (0, express_1.Router)();
// ── Google login ──────────────────────────────────────
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
// ── Google callback ───────────────────────────────────
router.get('/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    const user = req.user;
    if (!user.isOnboarded) {
        res.redirect(`${process.env.CLIENT_URL}/onboarding`);
    }
    else {
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }
});
// ── Get current user ──────────────────────────────────
router.get('/me', authMiddleware_1.default, (req, res) => {
    res.json({ success: true, data: req.user });
});
// ── Save onboarding data ──────────────────────────────
router.patch('/onboarding', authMiddleware_1.default, async (req, res) => {
    try {
        const user = req.user;
        const { region, niche, tone, goal, bio, audience, postTime, globalAudience, } = req.body;
        const regionConfig = (0, regionConfig_1.getRegionConfig)(region);
        const updated = await User_1.default.findByIdAndUpdate(user._id, {
            region,
            timezone: regionConfig.timezone,
            globalAudience: globalAudience ?? true,
            niche,
            tone,
            goal,
            bio: bio ?? '',
            audience: audience ?? '',
            postTime: postTime ?? '07:00',
            isOnboarded: true,
        }, { new: true });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to save onboarding' });
    }
});
// ── Update profile (settings) ─────────────────────────
router.patch('/profile', authMiddleware_1.default, async (req, res) => {
    try {
        const user = req.user;
        const updated = await User_1.default.findByIdAndUpdate(user._id, { ...req.body }, { new: true });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
});
// ── Logout ────────────────────────────────────────────
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err)
            return next(err);
        res.json({ success: true, message: 'Logged out' });
    });
});
exports.default = router;
