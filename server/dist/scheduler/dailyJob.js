"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDailyJob = exports.generatePostForUser = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const User_1 = __importDefault(require("../models/User"));
const Post_1 = __importDefault(require("../models/Post"));
const aiService_1 = require("../services/aiService");
const promptBuilder_1 = require("../services/promptBuilder");
const topicTagger_1 = require("../services/topicTagger");
const imageService_1 = require("../services/imageService");
const newsService_1 = require("../services/newsService");
const generatePostForUser = async (user) => {
    try {
        console.log(`📝 Generating post for ${user.email}`);
        // Check if post already generated today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await Post_1.default.findOne({
            userId: user._id,
            createdAt: { $gte: today },
        });
        if (existing) {
            console.log(`⏭️  Post already exists for ${user.email} today`);
            return;
        }
        // Get avoid topics
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const recentPosts = await Post_1.default.find({
            userId: user._id,
            createdAt: { $gte: sixtyDaysAgo },
        }).select('topicTags');
        const avoidTopics = recentPosts.flatMap(p => p.topicTags).filter(Boolean);
        // Fetch today's news
        const articles = await (0, newsService_1.fetchNewsByUser)(user);
        const topArticle = articles[0];
        const newsHeadline = topArticle
            ? `${topArticle.title}: ${topArticle.description ?? ''}`
            : undefined;
        // Post count for rotation
        const postCount = await Post_1.default.countDocuments({ userId: user._id });
        // Generate
        const prompt = (0, promptBuilder_1.buildWriterPrompt)(user, avoidTopics, newsHeadline, postCount);
        const content = await (0, aiService_1.generatePost)(prompt);
        const wordCount = content.split(/\s+/).length;
        const charCount = content.length;
        const topicTags = await (0, topicTagger_1.extractTopicTags)(content);
        // Image every 3 days
        const lastImageDate = user.lastImagePostDate;
        const daysSinceLast = lastImageDate
            ? Math.floor((Date.now() - new Date(lastImageDate).getTime()) / 86400000)
            : 999;
        const shouldGenImage = daysSinceLast >= 3;
        let finalImageUrl = null;
        let imageQuery = null;
        if (shouldGenImage) {
            imageQuery = await (0, imageService_1.generateImageQuery)(content);
            const generated = await (0, imageService_1.generateImageWithImagen)(imageQuery);
            if (generated) {
                finalImageUrl = generated;
                await User_1.default.findByIdAndUpdate(user._id, {
                    lastImagePostDate: new Date(),
                });
            }
        }
        // Save post
        await Post_1.default.create({
            userId: user._id,
            content,
            topicTags,
            source: 'auto',
            newsTitle: topArticle?.title ?? null,
            newsDescription: topArticle?.description ?? null,
            imageUrl: finalImageUrl,
            imageQuery: imageQuery,
            wordCount,
            charCount,
            status: 'generated',
        });
        console.log(`✅ Post generated for ${user.email}`);
    }
    catch (error) {
        console.error(`❌ Failed to generate for ${user.email}:`, error);
    }
};
exports.generatePostForUser = generatePostForUser;
const startDailyJob = () => {
    // Runs every day at 7 AM UTC
    // Adjust for timezones by staggering per user
    node_cron_1.default.schedule('0 7 * * *', async () => {
        console.log('🕐 Daily job starting...');
        const users = await User_1.default.find({ isOnboarded: true });
        console.log(`👥 Processing ${users.length} users`);
        // Stagger 30s per user to avoid API rate limits
        for (let i = 0; i < users.length; i++) {
            setTimeout(() => {
                (0, exports.generatePostForUser)(users[i]);
            }, i * 30000);
        }
    });
    console.log('✅ Daily job scheduler started (runs at 7 AM UTC)');
};
exports.startDailyJob = startDailyJob;
