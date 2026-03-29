import { useState } from 'react'
import api from '../api/axios'

interface Props {
  postId: string
  onClose: () => void
  onSubmitted: (score: number) => void
}

export default function EngagementModal({ postId, onClose, onSubmitted }: Props) {
  const [likes, setLikes]             = useState('')
  const [comments, setComments]       = useState('')
  const [reposts, setReposts]         = useState('')
  const [impressions, setImpressions] = useState('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  const submit = async () => {
    if (!likes || !comments || !reposts || !impressions) {
      setError('Please fill in all fields')
      return
    }
    setSaving(true)
    try {
      const { data } = await api.patch(`/posts/${postId}/engagement`, {
        likes:       Number(likes),
        comments:    Number(comments),
        reposts:     Number(reposts),
        impressions: Number(impressions),
      })
      onSubmitted(data.score)
      onClose()
    } catch {
      setError('Failed to save — try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 bottom-0 z-50 bg-white rounded-t-2xl p-6 pb-10 shadow-xl">

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900">
            How did your post perform?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Enter your LinkedIn post stats — this helps improve future posts
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              👍 Likes
            </label>
            <input
              type="number"
              min="0"
              value={likes}
              onChange={e => setLikes(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              💬 Comments
            </label>
            <input
              type="number"
              min="0"
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              🔁 Reposts
            </label>
            <input
              type="number"
              min="0"
              value={reposts}
              onChange={e => setReposts(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              👁️ Impressions
            </label>
            <input
              type="number"
              min="0"
              value={impressions}
              onChange={e => setImpressions(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Score preview */}
        {likes && comments && reposts && impressions && (
          <div className="bg-blue-50 rounded-xl p-3 mb-4 text-center">
            <p className="text-xs text-blue-500 mb-1">Engagement score</p>
            <p className="text-2xl font-bold text-blue-700">
              {Math.round(
                Number(comments) * 5 +
                Number(reposts)  * 4 +
                Number(likes)    * 1 +
                Number(impressions) * 0.01
              )}
            </p>
            <p className="text-xs text-blue-400 mt-1">
              Comments × 5 + Reposts × 4 + Likes × 1
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-xs mb-3">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-500 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Skip
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Submit stats'}
          </button>
        </div>

      </div>
    </>
  )
}