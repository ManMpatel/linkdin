"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchNewsByUser = void 0;
const axios_1 = __importDefault(require("axios"));
const Creator_1 = __importDefault(require("../models/Creator"));
// Build a smart search query from user profile + creator style
const buildNewsQuery = async (user) => {
    const parts = [];
    // 1. Niche — always included
    if (user.niche)
        parts.push(user.niche);
    // 2. Goal keywords
    const goalMap = {
        clients: 'client acquisition sales business growth',
        followers: 'personal brand audience growth influence',
        brand: 'thought leadership industry expertise',
        visibility: 'trending industry news career',
    };
    if (user.goal && goalMap[user.goal]) {
        parts.push(goalMap[user.goal]);
    }
    // 3. Creator vibe keywords (from style fingerprint)
    try {
        const creator = await Creator_1.default.findOne({ userId: user._id });
        if (creator?.styleFingerprint) {
            const fp = creator.styleFingerprint;
            // Add vibe keywords from creator style
            if (fp.vibeKeywords && Array.isArray(fp.vibeKeywords)) {
                parts.push(fp.vibeKeywords.slice(0, 3).join(' '));
            }
        }
    }
    catch {
        // Creator not found — continue without it
    }
    // 4. Tone adjustments
    const toneMap = {
        bold: 'controversial trends disruption',
        storytelling: 'success story lessons learned',
        professional: 'industry insights research data',
        casual: 'tips advice practical',
    };
    if (user.tone && toneMap[user.tone]) {
        parts.push(toneMap[user.tone]);
    }
    return parts.join(' ');
};
const fetchNewsByUser = async (user) => {
    try {
        if (!process.env.NEWS_API_KEY || process.env.NEWS_API_KEY === 'your_newsapi_key') {
            return getMockNews(user);
        }
        const query = await buildNewsQuery(user);
        console.log(`📰 News query for ${user.email}: "${query}"`);
        const { data } = await axios_1.default.get('https://newsapi.org/v2/everything', {
            params: {
                q: query,
                sortBy: 'publishedAt',
                pageSize: 8,
                language: 'en',
                apiKey: process.env.NEWS_API_KEY,
            },
        });
        const articles = (data.articles ?? []).filter((a) => a.title &&
            a.description &&
            !a.title.includes('[Removed]') &&
            a.description.length > 30);
        if (articles.length === 0)
            return getMockNews(user);
        return articles.slice(0, 6);
    }
    catch (error) {
        console.error('News fetch error:', error?.response?.data ?? error.message);
        return getMockNews(user);
    }
};
exports.fetchNewsByUser = fetchNewsByUser;
// Fallback mock news personalised to user
const getMockNews = (user) => {
    const niche = user.niche || 'Business';
    const now = new Date().toISOString();
    return [
        {
            title: `The ${niche} trends reshaping how professionals grow on LinkedIn in 2026`,
            description: `New research shows ${niche.toLowerCase()} professionals who post consistently see 3x more inbound opportunities. Here's what the data says.`,
            url: '#',
            source: { name: 'LinkedIn News' },
            publishedAt: now,
            urlToImage: null,
        },
        {
            title: `Why most ${niche.toLowerCase()} professionals are leaving money on the table`,
            description: 'The gap between those who build in public and those who stay silent is growing. This is what top performers are doing differently.',
            url: '#',
            source: { name: 'Forbes' },
            publishedAt: now,
            urlToImage: null,
        },
        {
            title: `AI is changing ${niche.toLowerCase()} faster than anyone predicted — here's the real impact`,
            description: 'Companies across the sector are restructuring. The professionals who adapt early will capture the most opportunity.',
            url: '#',
            source: { name: 'Business Insider' },
            publishedAt: now,
            urlToImage: null,
        },
        {
            title: 'The one LinkedIn habit that separates growing creators from stagnant ones',
            description: 'Consistency beats perfection every time. The data from 10,000 creators shows the same pattern over and over.',
            url: '#',
            source: { name: 'HubSpot Blog' },
            publishedAt: now,
            urlToImage: null,
        },
        {
            title: `${niche} industry sees major shift — what it means for your personal brand`,
            description: 'The market is changing. The professionals who position themselves now will be the ones audiences turn to in 12 months.',
            url: '#',
            source: { name: 'Inc Magazine' },
            publishedAt: now,
            urlToImage: null,
        },
        {
            title: 'Stop writing generic content. Here is what actually drives engagement in 2026',
            description: 'The LinkedIn algorithm has changed dramatically. Posts that combine personal insight with industry data are seeing 5x more reach.',
            url: '#',
            source: { name: 'Content Marketing Institute' },
            publishedAt: now,
            urlToImage: null,
        },
    ];
};
