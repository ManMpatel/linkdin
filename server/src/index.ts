import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import helmet from 'helmet'
import connectDB from './config/db'
import passport from './config/passport'
import authRoutes from './routes/auth'
import generateRoutes from './routes/generate'
import newsRoutes from './routes/news'
import postRoutes from './routes/posts'
import { startDailyJob }  from './scheduler/dailyJob'
import { startWeeklyJob } from './scheduler/weeklyJob'
import User from './models/User'
import creatorRoutes from './routes/creators'

import { generatePostForUser } from './scheduler/dailyJob'


const app = express()
const PORT = process.env.PORT || 5000

connectDB()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI as string,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: false,
  },
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/api/auth',     authRoutes)
app.use('/api/generate', generateRoutes)
app.use('/api/news',     newsRoutes)
app.use('/api/posts',    postRoutes)
app.use('/api/creators', creatorRoutes)


app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server running ✅' })
})

// ── Temp: list available Gemini models ───────────────
app.get('/api/models', async (_req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    )
    const data = await response.json() as any
    const names = data.models?.map((m: any) => m.name) ?? []
    res.json(names)
  } catch (e) {
    res.json({ error: String(e) })
  }
})
app.get('/api/test/daily', async (_req, res) => {
  try {
    const users = await User.find({ isOnboarded: true })
    for (const user of users) {
      await generatePostForUser(user)
    }
    res.json({ success: true, message: `Generated for ${users.length} users` })
  } catch (e) {
    res.json({ error: String(e) })
  }
})
startDailyJob()
startWeeklyJob()


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})

export default app
