import { Document } from 'mongoose'

// ─── USER ───────────────────────────────────────────
export interface IIntelligenceCard {
  lastUpdated: Date
  weeksCovered: number
  totalPostsAnalysed: number
  voice: {
    summary: string
    avgWordsPerLine: number
    emojiUsage: string
    sentenceStyle: string
  }
  whatWorks: {
    hookTypes: string[]
    postTypes: string[]
    topHashtags: string[]
    bestCTAStyle: string
    avgScoreWhenUsed: number
  }
  whatFails: {
    hookTypes: string[]
    postTypes: string[]
    avoidHashtags: string[]
    avgScoreWhenFailed: number
  }
  audienceInsight: string
  currentStreak: number
  topicsCovered: string[]
}

export interface IUser extends Document {
  googleId: string
  name: string
  email: string
  avatar: string
  isOnboarded: boolean
  // profile
  region: string
  timezone: string
  globalAudience: boolean
  niche: string
  tone: string
  goal: string
  bio: string
  audience: string
  followerCount: number
  // schedule
  postTime: string
  // streak
  currentStreak: number
  longestStreak: number
  // intelligence
  intelligenceCard: IIntelligenceCard | null
  // timestamps
  createdAt: Date
  updatedAt: Date
}

// ─── POST ───────────────────────────────────────────
export interface IEngagementData {
  likes: number
  comments: number
  reposts: number
  impressions: number
  score: number
  submittedAt: Date
}

export interface IPost extends Document {
  userId: IUser['_id']
  content: string
  topicTags: string[]
  hookType: string
  postType: string
  source: 'manual' | 'news' | 'auto'
  newsTitle: string | null
  newsDescription: string | null
  imageUrl: string | null
  imageSource: 'unsplash' | 'dalle' | null
  imageQuery: string | null
  rating: 'liked' | 'disliked' | null
  ratedAt: Date | null
  used: boolean
  usedAt: Date | null
  wordCount: number
  charCount: number
  engagementData: IEngagementData | null
  status: 'generated' | 'draft'
  createdAt: Date
  updatedAt: Date
}

// ─── CREATOR ────────────────────────────────────────
export interface IStyleFingerprint {
  hookPattern: string
  avgLineLength: number
  emojiUsage: string
  ctaStyle: string
  vocabularyLevel: string
  postExamples: string[]
}

export interface ICreator extends Document {
  userId: IUser['_id']
  name: string
  linkedinUrl: string | null
  screenshots: string[]
  styleFingerprint: IStyleFingerprint | null
  extractedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// ─── API RESPONSE ────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export {}