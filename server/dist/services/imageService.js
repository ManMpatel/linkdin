"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUnsplashImages = exports.generateImageWithImagen = exports.generateImageQuery = void 0;
const generative_ai_1 = require("@google/generative-ai");
const axios_1 = __importDefault(require("axios"));
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const generateImageQuery = async (postContent) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(`Write a short 10-word image generation prompt for this LinkedIn post.
Professional, photorealistic style. No text in image.
Return ONLY the prompt, nothing else.

Post: ${postContent.slice(0, 300)}`);
        return result.response.text().trim();
    }
    catch {
        return 'professional business meeting modern office';
    }
};
exports.generateImageQuery = generateImageQuery;
const generateImageWithImagen = async (prompt) => {
    try {
        const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:generateImages?key=${process.env.GEMINI_API_KEY}`, {
            prompt: { text: prompt },
            numberOfImages: 1,
            aspectRatio: '16:9',
        }, {
            headers: { 'Content-Type': 'application/json' },
        });
        const imageData = response.data?.generatedImages?.[0]?.image?.imageBytes;
        if (!imageData)
            return null;
        return `data:image/png;base64,${imageData}`;
    }
    catch (error) {
        console.error('Imagen error:', error?.response?.data ?? error.message);
        return null;
    }
};
exports.generateImageWithImagen = generateImageWithImagen;
const searchUnsplashImages = async (query) => {
    try {
        if (!process.env.UNSPLASH_ACCESS_KEY)
            return [];
        const { data } = await axios_1.default.get('https://api.unsplash.com/search/photos', {
            params: {
                query,
                per_page: 3,
                orientation: 'landscape',
            },
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
            },
        });
        return data.results.map((photo) => ({
            url: photo.urls.regular,
            thumb: photo.urls.thumb,
            credit: photo.user.name,
            creditLink: photo.user.links.html,
        }));
    }
    catch {
        return [];
    }
};
exports.searchUnsplashImages = searchUnsplashImages;
