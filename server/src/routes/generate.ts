import { Router, Request, Response } from 'express'
import authMiddleware from '../middleware/authMiddleware'
import { generatePost } from '../services/aiService'
import { buildWriterPrompt } from '../services/promptBuilder'
import { extractTopicTags } from '../services/topicTagger'
import { generateImageQuery, generateImageWithImagen } from '../services/imageService'
import Post from '../models/Post'
import User, { IUser } from '../models/User'
import Creator from '../models/Creator'
import axios from 'axios'


const router = Router()

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser

    // Get avoid topics (last 60 days)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    const recentPosts = await Post.find({
      userId:    user._id,
      createdAt: { $gte: sixtyDaysAgo },
    }).select('topicTags')
    const avoidTopics = recentPosts.flatMap(p => p.topicTags).filter(Boolean)
    const { topic, newsTitle, newsDescription, wantsImage, useCreatorStyle } = req.body

    const creatorDoc   = await Creator.findOne({ userId: user._id })
    const creatorStyle = creatorDoc?.styleFingerprint ?? null

    // Post count for rotation
    const postCount = await Post.countDocuments({ userId: user._id })

    // Build prompt + generate
    const newsHeadline = newsTitle
      ? `${newsTitle}: ${newsDescription ?? ''}`
      : topic ?? undefined

    const prompt = buildWriterPrompt(
      user,
      avoidTopics,
      newsHeadline,
      postCount,
      creatorStyle,
      useCreatorStyle === true && !!creatorStyle
    )    
    const content   = await generatePost(prompt)
    const wordCount = content.split(/\s+/).length
    const charCount = content.length
    const topicTags = await extractTopicTags(content)

    // Image — only if user wants it AND 3+ days since last
    const lastImageDate  = user.lastImagePostDate
    const daysSinceLast  = lastImageDate
      ? Math.floor((Date.now() - new Date(lastImageDate).getTime()) / 86400000)
      : 999
    const shouldGenImage = wantsImage === true && daysSinceLast >= 3

    let finalImageUrl: string | null = null
    let imageQuery: string | null    = null
    let imageSource: string | null   = null

    if (shouldGenImage) {
      imageQuery          = await generateImageQuery(content)
      const generated     = await generateImageWithImagen(imageQuery)
      if (generated) {
        finalImageUrl = generated
        imageSource   = 'dalle'
        await User.findByIdAndUpdate(user._id, {
          lastImagePostDate: new Date(),
        })
      }
    }

    // Save post
    const post = await Post.create({
      userId:          user._id,
      content,
      topicTags,
      source:          newsTitle ? 'news' : 'manual',
      newsTitle:       newsTitle ?? null,
      newsDescription: newsDescription ?? null,
      imageUrl:        finalImageUrl,
      imageSource:     imageSource,
      imageQuery:      imageQuery,
      wordCount,
      charCount,
      status:          'generated',
    })

    res.json({
      success: true,
      data: { ...post.toObject(), imageUrl: finalImageUrl },
    })
  } catch (error: any) {
    console.error('Generate error:', error)
    res.status(500).json({
      success: false,
      error: error.message ?? 'Generation failed',
    })
  }
})

router.get('/today', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user  = req.user as IUser
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const post  = await Post.findOne({
      userId:    user._id,
      createdAt: { $gte: today },
    }).sort({ createdAt: -1 })
    res.json({ success: true, data: post ?? null })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch today post' })
  }
})

// Generate image only (for illustrated card background)
router.post('/image-only', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { postContent } = req.body
    const imageQuery  = await generateImageQuery(postContent)
    const imageUrl    = await generateImageWithImagen(imageQuery)
    res.json({ success: true, imageUrl })
  } catch (error) {
    res.json({ success: true, imageUrl: null })
  }
})

// Generate a standalone quote from post content
router.post('/quote', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { postContent } = req.body
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent(`
From this LinkedIn post, extract or write ONE powerful standalone quote.

Rules:
- 1-2 sentences maximum
- No hashtags
- No questions
- Should work on its own without context
- Feels like a memorable insight or truth
- Simple words, deep meaning
- Like Raj Shamani style — short, punchy, real

Post:
${postContent}

Return ONLY the quote text. No quotes marks. No explanation.`)

    const quote = result.response.text().trim()
    res.json({ success: true, quote })
  } catch (error) {
    res.status(500).json({ success: false, quote: null })
  }
})

// Stock photo from Unsplash
router.post('/stock-image', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { postContent } = req.body
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent(
      `Extract a 3-word Unsplash search query from this LinkedIn post.
Return ONLY 3 words. No punctuation. Professional photography style.
Example: "team meeting office" or "technology innovation future"

Post: ${postContent.slice(0, 200)}`
    )
    const query = result.response.text().trim()

    if (!process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY === 'your_unsplash_key') {
      return res.json({ success: true, imageUrl: null, credit: null })
    }

    const { data } = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query, per_page: 5, orientation: 'squarish' },
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
    })

    const photo = data.results?.[0]
    if (!photo) return res.json({ success: true, imageUrl: null })

    res.json({
      success:  true,
      imageUrl: photo.urls.regular,
      credit:   photo.user.name,
    })
  } catch (error) {
    res.json({ success: true, imageUrl: null })
  }
})

// Extract bold stat from post
router.post('/extract-stat', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { postContent } = req.body
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent(
      `From this LinkedIn post, extract OR create one bold stat or number for a visual.

Rules:
- Must be a short number/percentage/multiplier like "73%", "3×", "$50B", "10,000"
- Context must be under 8 words
- If no stat exists in the post, CREATE one that fits the theme
- Return ONLY valid JSON

Format: { "number": "73%", "context": "of professionals feel undervalued" }

Post: ${postContent.slice(0, 400)}`
    )

    const raw   = result.response.text().trim()
    const clean = raw.replace(/```json|```/g, '').trim()
    const stat  = JSON.parse(clean)

    res.json({ success: true, stat })
  } catch {
    res.json({ success: true, stat: { number: '3×', context: 'More results with consistency' } })
  }
})

export default router