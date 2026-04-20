"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const aiService_1 = require("../services/aiService");
const promptBuilder_1 = require("../services/promptBuilder");
const topicTagger_1 = require("../services/topicTagger");
const imageService_1 = require("../services/imageService");
const Post_1 = __importDefault(require("../models/Post"));
const User_1 = __importDefault(require("../models/User"));
const Creator_1 = __importDefault(require("../models/Creator"));
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
router.post('/', authMiddleware_1.default, async (req, res) => {
    try {
        const user = req.user;
        // Get avoid topics (last 60 days)
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const recentPosts = await Post_1.default.find({
            userId: user._id,
            createdAt: { $gte: sixtyDaysAgo },
        }).select('topicTags');
        const avoidTopics = recentPosts.flatMap(p => p.topicTags).filter(Boolean);
        const { topic, newsTitle, newsDescription, wantsImage, useCreatorStyle, postFormat } = req.body;
        const creatorDoc = await Creator_1.default.findOne({ userId: user._id });
        const creatorStyle = creatorDoc?.styleFingerprint ?? null;
        // Post count for rotation
        const postCount = await Post_1.default.countDocuments({ userId: user._id });
        // Build prompt + generate
        const newsHeadline = newsTitle
            ? `${newsTitle}: ${newsDescription ?? ''}`
            : topic ?? undefined;
        const prompt = (0, promptBuilder_1.buildWriterPrompt)(user, avoidTopics, newsHeadline, postCount, creatorStyle, useCreatorStyle === true && !!creatorStyle, postFormat);
        const content = await (0, aiService_1.generatePost)(prompt);
        const wordCount = content.split(/\s+/).length;
        const charCount = content.length;
        const topicTags = await (0, topicTagger_1.extractTopicTags)(content);
        // Image — only if user wants it AND 3+ days since last
        const lastImageDate = user.lastImagePostDate;
        const daysSinceLast = lastImageDate
            ? Math.floor((Date.now() - new Date(lastImageDate).getTime()) / 86400000)
            : 999;
        const shouldGenImage = wantsImage === true && daysSinceLast >= 3;
        let finalImageUrl = null;
        let imageQuery = null;
        let imageSource = null;
        if (shouldGenImage) {
            imageQuery = await (0, imageService_1.generateImageQuery)(content);
            const generated = await (0, imageService_1.generateImageWithImagen)(imageQuery);
            if (generated) {
                finalImageUrl = generated;
                imageSource = 'dalle';
                await User_1.default.findByIdAndUpdate(user._id, {
                    lastImagePostDate: new Date(),
                });
            }
        }
        // Save post
        const post = await Post_1.default.create({
            userId: user._id,
            content,
            topicTags,
            source: newsTitle ? 'news' : 'manual',
            newsTitle: newsTitle ?? null,
            newsDescription: newsDescription ?? null,
            imageUrl: finalImageUrl,
            imageSource: imageSource,
            imageQuery: imageQuery,
            wordCount,
            charCount,
            status: 'generated',
        });
        res.json({
            success: true,
            data: { ...post.toObject(), imageUrl: finalImageUrl },
        });
    }
    catch (error) {
        console.error('Generate error:', error);
        res.status(500).json({
            success: false,
            error: error.message ?? 'Generation failed',
        });
    }
});
router.get('/today', authMiddleware_1.default, async (req, res) => {
    try {
        const user = req.user;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const post = await Post_1.default.findOne({
            userId: user._id,
            createdAt: { $gte: today },
        }).sort({ createdAt: -1 });
        res.json({ success: true, data: post ?? null });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch today post' });
    }
});
// Generate image only (for illustrated card background)
router.post('/image-only', authMiddleware_1.default, async (req, res) => {
    try {
        const { postContent } = req.body;
        const imageQuery = await (0, imageService_1.generateImageQuery)(postContent);
        const imageUrl = await (0, imageService_1.generateImageWithImagen)(imageQuery);
        res.json({ success: true, imageUrl });
    }
    catch (error) {
        res.json({ success: true, imageUrl: null });
    }
});
// Generate a standalone quote from post content
router.post('/quote', authMiddleware_1.default, async (req, res) => {
    try {
        const { postContent } = req.body;
        const { GoogleGenerativeAI } = await Promise.resolve().then(() => __importStar(require('@google/generative-ai')));
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(`
From this LinkedIn post, extract or write ONE powerful standalone quote.

Rules:
- 1-2 sentences maximum
- No hashtags
- No questions
- Should work on its own without context
- Feels like a memorable insight or truth
- Simple words, deep meaning
- Like Raj Shamani style — short, punchy, real

Post:
${postContent}

Return ONLY the quote text. No quotes marks. No explanation.`);
        const quote = result.response.text().trim();
        res.json({ success: true, quote });
    }
    catch (error) {
        res.status(500).json({ success: false, quote: null });
    }
});
// Stock photo from Unsplash
router.post('/stock-image', authMiddleware_1.default, async (req, res) => {
    try {
        const { postContent } = req.body;
        const { GoogleGenerativeAI } = await Promise.resolve().then(() => __importStar(require('@google/generative-ai')));
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(`Extract a 3-word Unsplash search query from this LinkedIn post.
Return ONLY 3 words. No punctuation. Professional photography style.
Example: "team meeting office" or "technology innovation future"

Post: ${postContent.slice(0, 200)}`);
        const query = result.response.text().trim();
        if (!process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY === 'your_unsplash_key') {
            return res.json({ success: true, imageUrl: null, credit: null });
        }
        const { data } = await axios_1.default.get('https://api.unsplash.com/search/photos', {
            params: { query, per_page: 5, orientation: 'squarish' },
            headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
        });
        const photo = data.results?.[0];
        if (!photo)
            return res.json({ success: true, imageUrl: null });
        res.json({
            success: true,
            imageUrl: photo.urls.regular,
            credit: photo.user.name,
        });
    }
    catch (error) {
        res.json({ success: true, imageUrl: null });
    }
});
// Extract bold stat from post
router.post('/extract-stat', authMiddleware_1.default, async (req, res) => {
    try {
        const { postContent } = req.body;
        const { GoogleGenerativeAI } = await Promise.resolve().then(() => __importStar(require('@google/generative-ai')));
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(`From this LinkedIn post, extract OR create one bold stat or number for a visual.

Rules:
- Must be a short number/percentage/multiplier like "73%", "3×", "$50B", "10,000"
- Context must be under 8 words
- If no stat exists in the post, CREATE one that fits the theme
- Return ONLY valid JSON

Format: { "number": "73%", "context": "of professionals feel undervalued" }

Post: ${postContent.slice(0, 400)}`);
        const raw = result.response.text().trim();
        const clean = raw.replace(/```json|```/g, '').trim();
        const stat = JSON.parse(clean);
        res.json({ success: true, stat });
    }
    catch {
        res.json({ success: true, stat: { number: '3×', context: 'More results with consistency' } });
    }
});
exports.default = router;
