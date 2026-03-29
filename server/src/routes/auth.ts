import { Router, Request, Response } from 'express'
import passport from 'passport'
import authMiddleware from '../middleware/authMiddleware'
import User from '../models/User'
import { getRegionConfig } from '../config/regionConfig'

const router = Router()

// ── Google login ──────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

// ── Google callback ───────────────────────────────────
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    const user = req.user as any
    if (!user.isOnboarded) {
      res.redirect(`${process.env.CLIENT_URL}/onboarding`)
    } else {
      res.redirect(`${process.env.CLIENT_URL}/dashboard`)
    }
  }
)

// ── Get current user ──────────────────────────────────
router.get('/me', authMiddleware, (req: Request, res: Response) => {
  res.json({ success: true, data: req.user })
})

// ── Save onboarding data ──────────────────────────────
router.patch(
  '/onboarding',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any
      const {
        region, niche, tone, goal,
        bio, audience, postTime, globalAudience,
      } = req.body

      const regionConfig = getRegionConfig(region)

      const updated = await User.findByIdAndUpdate(
        user._id,
        {
          region,
          timezone:       regionConfig.timezone,
          globalAudience: globalAudience ?? true,
          niche,
          tone,
          goal,
          bio:         bio ?? '',
          audience:    audience ?? '',
          postTime:    postTime ?? '07:00',
          isOnboarded: true,
        },
        { new: true }
      )

      res.json({ success: true, data: updated })
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to save onboarding' })
    }
  }
)

// ── Update profile (settings) ─────────────────────────
router.patch(
  '/profile',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any
      const updated = await User.findByIdAndUpdate(
        user._id,
        { ...req.body },
        { new: true }
      )
      res.json({ success: true, data: updated })
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update profile' })
    }
  }
)

// ── Logout ────────────────────────────────────────────
router.get('/logout', (req: Request, res: Response, next) => {
  req.logout((err) => {
    if (err) return next(err)
    res.json({ success: true, message: 'Logged out' })
  })
})

export default router
