import { IUser } from '../models/User'

const HOOK_TYPES = [
  'bold_claim', 'personal_failure', 'controversial_stat',
  'question', 'prediction', 'contrarian_take', 'story_open', 'listicle',
]

const POST_TYPES = [
  'story', 'insight', 'list', 'prediction', 'question', 'contrarian',
]

export const getHookType = (postCount: number): string =>
  HOOK_TYPES[postCount % HOOK_TYPES.length]

export const getPostType = (postCount: number): string =>
  POST_TYPES[new Date().getDay() % POST_TYPES.length]

export const buildWriterPrompt = (
  user: IUser,
  avoidTopics: string[],
  newsHeadline?: string,
  postCount: number = 0,
  creatorStyle?: any,
  useCreatorStyle?: boolean
): string => {
  const hookType = getHookType(postCount)
  const postType = getPostType(postCount)
  const avoid    = avoidTopics.length > 0 ? avoidTopics.join(', ') : 'none yet'

  const card = user.intelligenceCard as any
  let intelligenceSection = ''
  if (card && card.weeksCovered >= 1) {
    intelligenceSection = `
PERFORMANCE INSIGHTS (${card.weeksCovered} weeks of data — follow closely):
- Best hooks: ${card.whatWorks?.hookTypes?.join(', ')}
- Best formats: ${card.whatWorks?.postTypes?.join(', ')}
- Top hashtags: ${card.whatWorks?.topHashtags?.join(' ')}
- Best CTA: ${card.whatWorks?.bestCTAStyle}
- Audience insight: ${card.audienceInsight}
`
  }

  let creatorSection = ''
  if (useCreatorStyle && creatorStyle) {
    creatorSection = `
CREATOR STYLE TO MATCH (keep the vibe, not the exact words):
- Summary: ${creatorStyle.summary}
- Hook style: ${creatorStyle.hookStyle}
- Tone: ${creatorStyle.toneDescription}
- Line length: ${creatorStyle.avgLineLength}
- Vocabulary: ${creatorStyle.vocabularyLevel}
- Example hooks: ${creatorStyle.exampleHooks?.join(' | ')}
Match their VIBE — completely different content.
`
  }

  // Trending topic examples by niche
  const nicheTrends: Record<string, string> = {
    AI:         'AI replacing jobs, ChatGPT vs humans, prompt engineering, AI startups failing, future of work with AI',
    Tech:       'Google layoffs, big tech vs startups, coding with AI, developer skills 2026, remote work in tech',
    Business:   'startup failures, CEO mindset, how companies grow fast, business lessons from failure, leadership mistakes',
    Fitness:    'fitness myths, workout habits of successful people, mental health and exercise, discipline vs motivation',
    Finance:    'how the rich invest, financial mistakes in your 20s, passive income reality, stock market psychology',
    Marketing:  'viral content secrets, why ads fail, organic vs paid growth, personal brand vs company brand',
    Leadership: 'bad manager habits, how great leaders think, team culture secrets, hiring vs firing decisions',
    Startup:    'why startups fail, fundraising reality, building in public, MVP lessons, founder mental health',
    Career:     'how to get promoted faster, salary negotiation, career pivots, skills that pay the most',
  }

  const trendingExamples = nicheTrends[user.niche] ??
    'industry trends, lessons from failure, controversial opinions, data-backed insights'

  return `You are a LinkedIn content expert writing for a real person.

USER PROFILE:
- Niche: ${user.niche}
- Tone: ${user.tone}
- Goal: ${user.goal}
- Region: ${user.region}
${intelligenceSection}
${creatorSection}

${newsHeadline
  ? `TODAY'S NEWS ANGLE: "${newsHeadline}"
Write a post that connects this news to something real and useful for the reader.`
  : `TRENDING TOPICS IN ${user.niche.toUpperCase()} right now:
${trendingExamples}
Pick the most relevant and write about it with a fresh angle.`
}

Hook type today: ${hookType}
Post format today: ${postType}
Topics to avoid (already covered): ${avoid}

WRITING RULES — these are non-negotiable:
1. Write like a real person talking — not a consultant, not a robot
2. Short lines — maximum 1-2 sentences per line
3. No asterisks (**), no markdown, no bullet symbols like •
4. No filler phrases: "In today's world", "It's important to note", "Let's be honest"
5. No questions back to back — maximum 1 question total
6. Each line should pull the reader to the next — like a flow
7. The reader should FEEL something, not just learn something
8. Simple English — depth comes from the idea, not complex words
9. Start with something that makes a person stop scrolling
10. Never start with "I" as the first word

WHAT MAKES A GOOD LINKEDIN POST (examples of good hooks):
- "Google just fired 10,000 people. Here's what that actually means for you."
- "Most people think hard work is the answer. It's not."
- "The CEO of a $10B company works 4 hours a day. Here's why."
- "Nobody talks about this part of building a startup."

POST STRUCTURE:
Line 1-2: Hook — make them stop
Line 3-5: Build — tension, curiosity, or story
Line 6-8: Value — the real insight
Line 9-10: Takeaway — one clear thing to remember
Last line: One question to spark comments
Final: 3-5 hashtags on their own line

STRICT LIMITS:
- Under 400 words
- Under 3000 characters
- No labels like [HOOK] or [CONTENT]
- No asterisks or markdown formatting
- Output the post directly — nothing else`
}