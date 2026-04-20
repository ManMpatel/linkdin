"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWriterPrompt = exports.getPostType = exports.getHookType = void 0;
const HOOK_TYPES = [
    'bold_claim',
    'personal_failure',
    'controversial_stat',
    'question',
    'prediction',
    'contrarian_take',
    'story_open',
    'listicle',
];
const POST_TYPES = [
    'story',
    'insight',
    'list',
    'prediction',
    'question',
    'contrarian',
];
const getHookType = (postCount) => {
    return HOOK_TYPES[postCount % HOOK_TYPES.length];
};
exports.getHookType = getHookType;
const getPostType = (postCount) => {
    const day = new Date().getDay();
    return POST_TYPES[day % POST_TYPES.length];
};
exports.getPostType = getPostType;
const buildWriterPrompt = (user, avoidTopics, newsHeadline, postCount = 0, creatorStyle, useCreatorStyle, requestedFormat) => {
    // Creator style section
    let creatorSection = '';
    if (useCreatorStyle && creatorStyle) {
        creatorSection = `
CREATOR STYLE TO MATCH (keep the vibe, not the exact words):
- Overall vibe: ${creatorStyle.summary}
- Hook style: ${creatorStyle.hookStyle}
- Tone: ${creatorStyle.toneDescription}
- Line length: ${creatorStyle.avgLineLength}
- Emoji usage: ${creatorStyle.emojiUsage}
- CTA style: ${creatorStyle.ctaStyle}
- Vocabulary: ${creatorStyle.vocabularyLevel}
- Vibe keywords: ${creatorStyle.vibeKeywords?.join(', ')}
- Example hooks in their style: ${creatorStyle.exampleHooks?.join(' | ')}

IMPORTANT: Match their VIBE and STYLE — but write completely different content.
`;
    }
    const hookType = (0, exports.getHookType)(postCount);
    const postType = requestedFormat || (0, exports.getPostType)(postCount);
    const avoid = avoidTopics.length > 0
        ? avoidTopics.join(', ')
        : 'none yet';
    const card = user.intelligenceCard;
    let intelligenceSection = '';
    if (card && card.weeksCovered >= 1) {
        intelligenceSection = `
PERFORMANCE INSIGHTS (${card.weeksCovered} weeks of data):
- Voice: ${card.voice?.summary ?? ''}
- Best hook types: ${card.whatWorks?.hookTypes?.join(', ') ?? ''} — USE THESE
- Best post types: ${card.whatWorks?.postTypes?.join(', ') ?? ''} — USE THESE
- Top hashtags: ${card.whatWorks?.topHashtags?.join(' ') ?? ''} — PRIORITISE THESE
- Avoid hooks: ${card.whatFails?.hookTypes?.join(', ') ?? ''}
- Avoid post types: ${card.whatFails?.postTypes?.join(', ') ?? ''}
- Best CTA style: ${card.whatWorks?.bestCTAStyle ?? ''}
- Audience insight: ${card.audienceInsight ?? ''}
`;
    }
    return `You are a LinkedIn content expert.
Write a HIGH-ENGAGEMENT LinkedIn post.

User details:
- Niche: ${user.niche}
- Tone: ${user.tone}
- Goal: ${user.goal}
- Region: ${user.region}
${intelligenceSection}
${creatorSection}
- Target: global ${user.niche} professionals
${intelligenceSection}
${newsHeadline
        ? `Base the post around this trending news: "${newsHeadline}"`
        : `Write about a trending topic in ${user.niche}`}

Hook type: ${hookType}
Post type: ${postType}

Topics already covered — DO NOT repeat: ${avoid}

Instructions:
1. Write like a real, vulnerable human sharing an experience, not a generic AI consultant. Let your personality show. Include small imperfections, relatable struggles, or a touch of humor if appropriate.
2. Short lines — maximum 1-2 sentences per line. Make it punchy.
3. No asterisks (**), no markdown, no bullet symbols like •
4. BAN THESE WORDS/PHRASES entirely: "In today's fast-paced world", "It's important to note", "Let's be honest", "Furthermore", "Delve", "Crucial", "Game-changer".
5. No questions back to back — maximum 1 question total.
6. Each line should pull the reader to the next naturally.
7. The reader should FEEL something (inspired, challenged, understood), not just read facts.
8. Use simple, everyday English. Depth comes from the unique angle, not complex vocabulary.
9. Start with a hook that makes a person stop scrolling.

WHAT MAKES A GOOD LINKEDIN HOOK (examples):
- "I made a massive mistake last year that cost me thousands. Here's what I learned."
- "Most people think hard work is the answer. I completely disagree."
- "The hardest part about building a career isn't the work. It's the silent anxiety."
- "Stop doing [common practice]. Do this instead."

POST STRUCTURE & VIBE GUIDELINES:
${postType === 'story' ? `VIBE: A personal anecdote. Start in the middle of a scene or an emotional moment. Tell a brief story of failure, realization, or success. Make it relatable.` : ''}
${postType === 'unpopular_opinion' ? `VIBE: Contrarian and bold. Challenge a widely accepted industry norm. State your unpopular opinion clearly, explain why the majority is wrong, and offer your alternative approach.` : ''}
${postType === 'behind_the_scenes' ? `VIBE: Transparent and raw. Show the messy reality of your work process. Talk about what goes on behind closed doors, the rejections, the drafts, or the long hours.` : ''}
${postType === 'mistake' ? `VIBE: Humble and reflective. Share a specific failure or poor decision you made. Detail the consequences, what you learned, and how it changed your perspective.` : ''}
${postType === 'rant' ? `VIBE: Passionate and slightly frustrated (but constructive). Call out a frustrating trend or behavior in your industry. Explain why it's bad and how we can do better.` : ''}
${postType === 'insight' ? `VIBE: Analytical but accessible. Break down a complex idea, framework, or trend into a simple, digestible concept. Use an analogy if helpful.` : ''}
${!['story', 'unpopular_opinion', 'behind_the_scenes', 'mistake', 'rant', 'insight'].includes(postType) ? `VIBE: Insightful and engaging. Open with a strong hook, build tension or curiosity, deliver the core insight, and close with a clear takeaway.` : ''}

STRUCTURE:
Line 1-2: Hook — make them stop immediately.
Middle: Build context, share the story, or argue your point. Keep it engaging.
Ending: One clear takeaway or lesson.
Last line: One question to spark comments (optional).
Final: 3-5 hashtags on their own line.

STRICT:
- Under 400 words
- Under 3000 characters
- No labels like [HOOK]
- Output post directly — nothing else`;
};
exports.buildWriterPrompt = buildWriterPrompt;
