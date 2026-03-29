import { IUser } from '../models/User'

const HOOK_TYPES = [
  'bold_claim',
  'personal_failure',
  'controversial_stat',
  'question',
  'prediction',
  'contrarian_take',
  'story_open',
  'listicle',
]

const POST_TYPES = [
  'story',
  'insight',
  'list',
  'prediction',
  'question',
  'contrarian',
]

export const getHookType = (postCount: number): string => {
  return HOOK_TYPES[postCount % HOOK_TYPES.length]
}



export const getPostType = (postCount: number): string => {
  const day = new Date().getDay()
  return POST_TYPES[day % POST_TYPES.length]
}

export const buildWriterPrompt = (
  user: IUser,
  avoidTopics: string[],
  newsHeadline?: string,
  postCount: number = 0,
  creatorStyle?: any,
  useCreatorStyle?: boolean
): string => {

  // Creator style section
let creatorSection = ''
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
`
}
  const hookType = getHookType(postCount)
  const postType = getPostType(postCount)
  const avoid    = avoidTopics.length > 0
    ? avoidTopics.join(', ')
    : 'none yet'

  const card = user.intelligenceCard as any
  let intelligenceSection = ''

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
`
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
  : `Write about a trending topic in ${user.niche}`
}

Hook type: ${hookType}
Post type: ${postType}

Topics already covered — DO NOT repeat: ${avoid}

Instructions:
- Simple human tone
- Short lines (1-2 sentences per line)
- Mobile-friendly
- Emotional or relatable angle
- Do NOT sound like AI
- Do NOT start with "I"

Structure:
1. Strong hook — first 2 lines stop scrolling
2. Build curiosity
3. Give value or story
4. Clear takeaway
5. Question CTA
6. 3-5 hashtags on last line

STRICT:
- Under 400 words
- Under 3000 characters
- No filler phrases
- Output post directly — no labels like [HOOK]`
}