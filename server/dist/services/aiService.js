"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePost = void 0;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const generatePost = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return text.trim();
    }
    catch (error) {
        console.error('AI generation error:', error);
        throw new Error('Failed to generate post');
    }
};
exports.generatePost = generatePost;
