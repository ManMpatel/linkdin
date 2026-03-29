import mongoose, { Schema, Document } from 'mongoose'

export interface ICreator extends Document {
  userId: any
  name: string
  linkedinUrl: string | null
  screenshots: string[]
  styleFingerprint: any | null
  extractedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const CreatorSchema = new Schema<ICreator>(
  {
    userId:           { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name:             { type: String, default: '' },
    linkedinUrl:      { type: String, default: null },
    screenshots:      { type: [String], default: [] },
    styleFingerprint: { type: Schema.Types.Mixed, default: null },
    extractedAt:      { type: Date, default: null },
  },
  { timestamps: true }
)

export default mongoose.model<ICreator>('Creator', CreatorSchema)