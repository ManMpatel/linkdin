import mongoose, { Schema, Document } from 'mongoose'

export interface IPost extends Document {
  userId: any
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
  engagementData: any | null
  status: 'generated' | 'draft'
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>(
  {
    userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content:         { type: String, required: true },
    topicTags:       { type: [String], default: [] },
    hookType:        { type: String, default: '' },
    postType:        { type: String, default: '' },
    source:          { type: String, enum: ['manual', 'news', 'auto'], default: 'manual' },
    newsTitle:       { type: String, default: null },
    newsDescription: { type: String, default: null },
    imageUrl:        { type: String, default: null },
    imageSource:     { type: String, default: null },
    imageQuery:      { type: String, default: null },
    rating:          { type: String, default: null },
    ratedAt:         { type: Date, default: null },
    used:            { type: Boolean, default: false },
    usedAt:          { type: Date, default: null },
    wordCount:       { type: Number, default: 0 },
    charCount:       { type: Number, default: 0 },
    engagementData:  { type: Schema.Types.Mixed, default: null },
    status:          { type: String, enum: ['generated', 'draft'], default: 'generated' },
  },
  { timestamps: true }
)

export default mongoose.model<IPost>('Post', PostSchema)