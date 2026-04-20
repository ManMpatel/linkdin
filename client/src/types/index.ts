export interface IUser {
  _id: string
  name: string
  email: string
  avatar: string
  isOnboarded: boolean
  region: string
  timezone: string
  globalAudience: boolean
  niche: string
  tone: string
  goal: string
  bio: string
  audience: string
  followerCount: number
  postTime: string
  currentStreak: number
  longestStreak: number
}

export interface IPost {
  _id: string
  content: string
  topicTags: string[]
  hookType: string
  postType: string
  source: 'manual' | 'news' | 'auto'
  newsTitle: string | null
  imageUrl: string | null
  imageSource: 'unsplash' | 'dalle' | null
  rating: 'liked' | 'disliked' | null
  used: boolean
  wordCount: number
  charCount: number
  status: 'generated' | 'draft'
  createdAt: string
}

export interface INewsArticle {
  title: string
  description: string
  url: string
  source: { name: string }
  publishedAt: string
  urlToImage: string | null
}

export type Niche =
  | 'AI' | 'Fitness' | 'Business'
  | 'Startup' | 'Finance' | 'Marketing'
  | 'Leadership' | 'Tech' | 'Other'

export type Tone =
  | 'professional' | 'bold'
  | 'storytelling' | 'casual'

export type Goal =
  | 'clients' | 'followers'
  | 'brand' | 'visibility'