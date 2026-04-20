import cron from 'node-cron'
import User from '../models/User'
import Post from '../models/Post'
import { generatePost } from '../services/aiService'

const analyseUserData = async (userId: string): Promise<void> => {
  try {
    const user = await User.findById(userId)
    if (!user) return

    // Get last 7 days posts with engagement
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentPosts = await Post.find({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    }).select('content topicTags hookType postType engagementData rating')

    if (recentPosts.length === 0) {
      console.log(`⏭️  No posts to analyse for ${user.email}`)
      return
    }

    // Build analysis data
    const postsData = recentPosts.map(p => ({
      hookType:       p.hookType,
      postType:       p.postType,
      score:          p.engagementData?.score ?? 0,
      rating:         p.rating,
      topicTags:      p.topicTags,
      firstLine:      p.content.split('\n')[0].slice(0, 100),
    }))

    const previousCard = user.intelligenceCard
      ? JSON.stringify(user.intelligenceCard)
      : 'No previous data'

    const analyserPrompt = `You are a LinkedIn content performance analyst.
Analyse the past 7 days of post data and update the intelligence card.

PREVIOUS INTELLIGENCE CARD:
${previousCard}

NEW DATA (last 7 days — ${postsData.length} posts):
${JSON.stringify(postsData, null, 2)}

RULES:
- Merge new findings with previous card
- New data = 40% weight, previous card = 60% weight
- If weeksCovered is under 4, trust new data more (60/40)
- Be specific in audienceInsight — no generic statements
- Update topicsCovered — add new ones, remove topics older than 60 days
- Output ONLY valid JSON. No explanation. No markdown. No code blocks.

OUTPUT this exact JSON structure:
{
  "lastUpdated": "${new Date().toISOString()}",
  "weeksCovered": <number>,
  "totalPostsAnalysed": <number>,
  "voice": {
    "summary": "<what works for this user>",
    "avgWordsPerLine": <number>,
    "emojiUsage": "<rarely/sometimes/often>",
    "sentenceStyle": "<description>"
  },
  "whatWorks": {
    "hookTypes": ["<type1>", "<type2>"],
    "postTypes": ["<type1>"],
    "topHashtags": ["#tag1", "#tag2"],
    "bestCTAStyle": "<description>",
    "avgScoreWhenUsed": <number>
  },
  "whatFails": {
    "hookTypes": ["<type>"],
    "postTypes": ["<type>"],
    "avoidHashtags": ["#tag"],
    "avgScoreWhenFailed": <number>
  },
  "audienceInsight": "<specific insight>",
  "currentStreak": ${user.currentStreak},
  "topicsCovered": [${recentPosts.flatMap(p => p.topicTags).map(t => `"${t}"`).join(', ')}]
}`

    // Call AI
    const rawCard = await generatePost(analyserPrompt)

    // Parse JSON
    const clean = rawCard
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const intelligenceCard = JSON.parse(clean)

    // Save to user
    await User.findByIdAndUpdate(userId, { intelligenceCard })
    console.log(`✅ Intelligence card updated for ${user.email}`)
  } catch (error) {
    console.error(`❌ Weekly analysis failed for ${userId}:`, error)
  }
}

export const startWeeklyJob = (): void => {
  // Runs every Sunday at 11 PM UTC
  cron.schedule('0 23 * * 0', async () => {
    console.log('🧠 Weekly analyst job starting...')

    const users = await User.find({ isOnboarded: true })
    console.log(`👥 Analysing ${users.length} users`)

    for (let i = 0; i < users.length; i++) {
      setTimeout(() => {
        analyseUserData(users[i]._id.toString())
      }, i * 30000)
    }
  })

  console.log('✅ Weekly analyst job started (runs Sunday 11 PM UTC)')
}
