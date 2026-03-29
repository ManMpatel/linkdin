import { Router, Request, Response } from 'express'
import authMiddleware from '../middleware/authMiddleware'
import { fetchNewsByUser } from '../services/newsService'
import { IUser } from '../models/User'

const router = Router()

// router.get('/', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const user     = req.user as IUser
//     let articles   = await fetchNewsByUser(user.niche || 'business', user.region || 'AU')

//     // Fallback mock data if API key not set or returns empty
//     if (articles.length === 0) {
//       articles = [
//         {
//           title:       'AI is reshaping how professionals build their personal brand on LinkedIn',
//           description: 'New research shows professionals using AI tools for content creation see 3x more engagement than those writing manually.',
//           url:         '#',
//           source:      { name: 'LinkedIn News' },
//           publishedAt: new Date().toISOString(),
//           urlToImage:  null,
//         },
//         {
//           title:       'The 5 LinkedIn habits that top creators use every single day',
//           description: 'Consistency, authenticity and timing are the three pillars of LinkedIn growth according to a new study of 10,000 creators.',
//           url:         '#',
//           source:      { name: 'Forbes' },
//           publishedAt: new Date().toISOString(),
//           urlToImage:  null,
//         },
//         {
//           title:       `${user.niche} industry sees major shift as remote work becomes permanent`,
//           description: 'Companies across the sector are restructuring their approach to talent acquisition and retention in response to changing work patterns.',
//           url:         '#',
//           source:      { name: 'Business Insider' },
//           publishedAt: new Date().toISOString(),
//           urlToImage:  null,
//         },
//         {
//           title:       'Why your LinkedIn content strategy needs a complete rethink in 2026',
//           description: 'The algorithm has changed dramatically. Here is what is actually working for creators who are growing their audience right now.',
//           url:         '#',
//           source:      { name: 'HubSpot Blog' },
//           publishedAt: new Date().toISOString(),
//           urlToImage:  null,
//         },
//       ]
//     }

//     res.json({ success: true, data: articles })
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Failed to fetch news' })
//   }
// })
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user     = req.user as IUser
    const articles = await fetchNewsByUser(user)
    res.json({ success: true, data: articles })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch news' })
  }
})

export default router