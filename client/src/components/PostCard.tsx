import { useState } from 'react'
import api from '../api/axios'

interface Post {
  _id: string
  content: string
  imageUrl: string | null
  used: boolean
  rating: string | null
  source: string
  createdAt: string
  engagementData: any | null
}

interface Props {
  post: Post
  onDelete: (id: string) => void
}

export default function PostCard({ post, onDelete }: Props) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(post.content)
    setCopied(true)
    await api.patch(`/posts/${post._id}/used`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-4">
        <p className={`text-gray-700 text-sm leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {post.content}
        </p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-500 text-xs mt-1"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      </div>
      <div className="flex border-t border-gray-100">
        <button
          onClick={copy}
          className="flex-1 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          {copied ? '✅ Copied!' : '📋 Copy'}
        </button>
        <button
          onClick={() => onDelete(post._id)}
          className="flex-1 py-3 text-sm font-medium text-red-400 hover:bg-red-50 border-l border-gray-100"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  )
}