"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const helmet_1 = __importDefault(require("helmet"));
const db_1 = __importDefault(require("./config/db"));
const passport_1 = __importDefault(require("./config/passport"));
const auth_1 = __importDefault(require("./routes/auth"));
const generate_1 = __importDefault(require("./routes/generate"));
const news_1 = __importDefault(require("./routes/news"));
const posts_1 = __importDefault(require("./routes/posts"));
const dailyJob_1 = require("./scheduler/dailyJob");
const weeklyJob_1 = require("./scheduler/weeklyJob");
const User_1 = __importDefault(require("./models/User"));
const creators_1 = __importDefault(require("./routes/creators"));
const dailyJob_2 = require("./scheduler/dailyJob");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
(0, db_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: false,
    },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use('/api/auth', auth_1.default);
app.use('/api/generate', generate_1.default);
app.use('/api/news', news_1.default);
app.use('/api/posts', posts_1.default);
app.use('/api/creators', creators_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Server running ✅' });
});
// ── Temp: list available Gemini models ───────────────
app.get('/api/models', async (_req, res) => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        const names = data.models?.map((m) => m.name) ?? [];
        res.json(names);
    }
    catch (e) {
        res.json({ error: String(e) });
    }
});
app.get('/api/test/daily', async (_req, res) => {
    try {
        const users = await User_1.default.find({ isOnboarded: true });
        for (const user of users) {
            await (0, dailyJob_2.generatePostForUser)(user);
        }
        res.json({ success: true, message: `Generated for ${users.length} users` });
    }
    catch (e) {
        res.json({ error: String(e) });
    }
});
(0, dailyJob_1.startDailyJob)();
(0, weeklyJob_1.startWeeklyJob)();
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
exports.default = app;
