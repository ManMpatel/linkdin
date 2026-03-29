import { Router, Request, Response } from 'express'
import authMiddleware from '../middleware/authMiddleware'
import Post from '../models/Post'
import { IUser } from '../models/User'
import { incrementStreak } from '../services/streakService'

const router = Router()

// ── Get all posts ─────────────────────────────────────
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user  = req.user as IUser
    const posts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
    res.json({ success: true, data: posts })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch posts' })
  }
})

// ── Mark post as used (copied) — increments streak ───
router.patch('/:id/used', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      { used: true, usedAt: new Date() },
      { new: true }
    )
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' })
      return
    }

    // Increment streak
    await incrementStreak(user._id.toString())

    res.json({ success: true, data: post })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark used' })
  }
})

// ── Rate post (like / dislike) ────────────────────────
router.patch('/:id/rate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user       = req.user as IUser
    const { rating } = req.body
    const post       = await Post.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      { rating, ratedAt: new Date() },
      { new: true }
    )
    res.json({ success: true, data: post })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to rate post' })
  }
})

// ── Submit engagement data ────────────────────────────
router.patch('/:id/engagement', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser
    const { likes, comments, reposts, impressions } = req.body

    // Validate
    if (
      likes === undefined || comments === undefined ||
      reposts === undefined || impressions === undefined
    ) {
      res.status(400).json({
        success: false,
        error: 'likes, comments, reposts and impressions are required',
      })
      return
    }

    // Compute engagement score
    const score =
      (Number(comments)   * 5)  +
      (Number(reposts)    * 4)  +
      (Number(likes)      * 1)  +
      (Number(impressions) * 0.01)

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      {
        engagementData: {
          likes:       Number(likes),
          comments:    Number(comments),
          reposts:     Number(reposts),
          impressions: Number(impressions),
          score:       Math.round(score),
          submittedAt: new Date(),
        },
      },
      { new: true }
    )

    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' })
      return
    }

    res.json({ success: true, data: post, score: Math.round(score) })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save engagement' })
  }
})

// ── Delete post ───────────────────────────────────────
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser
    await Post.findOneAndDelete({ _id: req.params.id, userId: user._id })
    res.json({ success: true, message: 'Deleted' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete post' })
  }
})

export default router