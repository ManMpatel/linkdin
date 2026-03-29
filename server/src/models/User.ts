import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  googleId: string
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
  lastImagePostDate: Date | null
  intelligenceCard: any | null
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    googleId:       { type: String, required: true, unique: true },
    name:           { type: String, required: true },
    email:          { type: String, required: true, unique: true },
    avatar:         { type: String, default: '' },
    isOnboarded:    { type: Boolean, default: false },
    region:         { type: String, default: 'AU' },
    timezone:       { type: String, default: 'Australia/Sydney' },
    globalAudience: { type: Boolean, default: true },
    niche:          { type: String, default: '' },
    tone:           { type: String, default: 'professional' },
    goal:           { type: String, default: '' },
    bio:            { type: String, default: '' },
    audience:       { type: String, default: '' },
    followerCount:  { type: Number, default: 0 },
    postTime:       { type: String, default: '07:00' },
    lastImagePostDate: { type: Date, default: null },
    currentStreak:  { type: Number, default: 0 },
    longestStreak:  { type: Number, default: 0 },
    intelligenceCard: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
)

export default mongoose.model<IUser>('User', UserSchema)