import { Router, Request, Response } from 'express'
import authMiddleware from '../middleware/authMiddleware'
import Creator from '../models/Creator'
import { extractStyleFromCreators } from '../services/styleExtractor'
import { IUser } from '../models/User'
import multer from 'multer'

const router  = Router()
const upload  = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10MB per file
})

// ── Get creators for current user ─────────────────────
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user     = req.user as IUser
    const creators = await Creator.find({ userId: user._id })
    res.json({ success: true, data: creators })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch creators' })
  }
})

// ── Upload screenshots + extract style ────────────────
router.post(
  '/analyse',
  authMiddleware,
  upload.array('screenshots', 20), // max 20 images (10 per creator)
  async (req: Request, res: Response) => {
    try {
      const user  = req.user as IUser
      const files = req.files as Express.Multer.File[]

      // Parse creator data from form
      const creator1Text = req.body.creator1Text ?? ''
      const creator2Text = req.body.creator2Text ?? ''

      // Split files between creators
      // Files named creator1_0, creator1_1 etc OR split by count
      const creator1Files = files.filter((_, i) => i < 10)
      const creator2Files = files.filter((_, i) => i >= 10)

      // Convert to base64
      const toBase64 = (files: Express.Multer.File[]) =>
        files.map(f => f.buffer.toString('base64'))

      const creators = []

      if (creator1Files.length > 0 || creator1Text.trim()) {
        creators.push({
          imageBase64: toBase64(creator1Files),
          manualText:  creator1Text,
          mimeTypes:   creator1Files.map(f => f.mimetype),
        })
      }

      if (creator2Files.length > 0 || creator2Text.trim()) {
        creators.push({
          imageBase64: toBase64(creator2Files),
          manualText:  creator2Text,
          mimeTypes:   creator2Files.map(f => f.mimetype),
        })
      }

      if (creators.length === 0) {
        res.status(400).json({ success: false, error: 'No creator data provided' })
        return
      }

      // Extract blended style fingerprint
      const styleFingerprint = await extractStyleFromCreators(creators)

      // Save to DB — upsert (replace if exists)
      await Creator.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          styleFingerprint,
          extractedAt: new Date(),
        },
        { upsert: true, new: true }
      )

      res.json({ success: true, data: styleFingerprint })
    } catch (error: any) {
      console.error('Creator analyse error:', error)
      res.status(500).json({
        success: false,
        error: error.message ?? 'Analysis failed',
      })
    }
  }
)

// ── Delete creator style ──────────────────────────────
router.delete('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser
    await Creator.findOneAndDelete({ userId: user._id })
    res.json({ success: true, message: 'Creator style deleted' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete' })
  }
})

export default router


