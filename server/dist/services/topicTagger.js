"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTopicTags = void 0;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const extractTopicTags = async (postContent) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(`Extract 3-5 topic tags from this LinkedIn post.
Return ONLY a JSON array of short topic strings.
Example: ["AI tools", "productivity", "leadership"]
No explanation. No markdown. No code blocks.

Post:
${postContent}`);
        const text = result.response.text().trim();
        const clean = text.replace(/```json|```/g, '').trim();
        const tags = JSON.parse(clean);
        return Array.isArray(tags) ? tags : [];
    }
    catch (error) {
        console.error('Topic tagger error:', error);
        return [];
    }
};
exports.extractTopicTags = extractTopicTags;
