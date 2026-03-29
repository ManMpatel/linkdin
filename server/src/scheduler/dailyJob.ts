import cron from 'node-cron'
import User, { IUser } from '../models/User'
import Post from '../models/Post'
import { generatePost } from '../services/aiService'
import { buildWriterPrompt } from '../services/promptBuilder'
import { extractTopicTags } from '../services/topicTagger'
import { generateImageQuery, generateImageWithImagen } from '../services/imageService'
import { fetchNewsByUser } from '../services/newsService'

export const generatePostForUser = async (user: IUser): Promise<void> => {
  try {
    console.log(`📝 Generating post for ${user.email}`)

    // Check if post already generated today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const existing = await Post.findOne({
      userId:    user._id,
      createdAt: { $gte: today },
    })
    if (existing) {
      console.log(`⏭️  Post already exists for ${user.email} today`)
      return
    }

    // Get avoid topics
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    const recentPosts = await Post.find({
      userId:    user._id,
      createdAt: { $gte: sixtyDaysAgo },
    }).select('topicTags')
    const avoidTopics = recentPosts.flatMap(p => p.topicTags).filter(Boolean)

    // Fetch today's news
    const articles = await fetchNewsByUser(user)
    const topArticle  = articles[0]
    const newsHeadline = topArticle
      ? `${topArticle.title}: ${topArticle.description ?? ''}`
      : undefined

    // Post count for rotation
    const postCount = await Post.countDocuments({ userId: user._id })

    // Generate
    const prompt    = buildWriterPrompt(user, avoidTopics, newsHeadline, postCount)
    const content   = await generatePost(prompt)
    const wordCount = content.split(/\s+/).length
    const charCount = content.length
    const topicTags = await extractTopicTags(content)

    // Image every 3 days
    const lastImageDate = user.lastImagePostDate
    const daysSinceLast = lastImageDate
      ? Math.floor((Date.now() - new Date(lastImageDate).getTime()) / 86400000)
      : 999
    const shouldGenImage = daysSinceLast >= 3

    let finalImageUrl: string | null = null
    let imageQuery: string | null    = null

    if (shouldGenImage) {
      imageQuery       = await generateImageQuery(content)
      const generated  = await generateImageWithImagen(imageQuery)
      if (generated) {
        finalImageUrl = generated
        await User.findByIdAndUpdate(user._id, {
          lastImagePostDate: new Date(),
        })
      }
    }

    // Save post
    await Post.create({
      userId:          user._id,
      content,
      topicTags,
      source:          'auto',
      newsTitle:       topArticle?.title ?? null,
      newsDescription: topArticle?.description ?? null,
      imageUrl:        finalImageUrl,
      imageQuery:      imageQuery,
      wordCount,
      charCount,
      status:          'generated',
    })

    console.log(`✅ Post generated for ${user.email}`)
  } catch (error) {
    console.error(`❌ Failed to generate for ${user.email}:`, error)
  }
}

export const startDailyJob = (): void => {
  // Runs every day at 7 AM UTC
  // Adjust for timezones by staggering per user
  cron.schedule('0 7 * * *', async () => {
    console.log('🕐 Daily job starting...')

    const users = await User.find({ isOnboarded: true })
    console.log(`👥 Processing ${users.length} users`)

    // Stagger 30s per user to avoid API rate limits
    for (let i = 0; i < users.length; i++) {
      setTimeout(() => {
        generatePostForUser(users[i])
      }, i * 30000)
    }
  })

  console.log('✅ Daily job scheduler started (runs at 7 AM UTC)')
}
