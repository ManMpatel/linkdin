import { useEffect, useState } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import ImageCanvas from '../components/ImageCanvas/index'

interface Post {
  _id: string
  content: string
  imageUrl: string | null
  used: boolean
  rating: 'liked' | 'disliked' | null
  source: 'manual' | 'news' | 'auto'
  wordCount: number
  createdAt: string
  engagementData: {
    likes: number
    comments: number
    reposts: number
    impressions: number
    score: number
  } | null
}

type Filter = 'all' | 'used' | 'liked' | 'disliked'

export default function History() {
  const [posts, setPosts]     = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<Filter>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied]   = useState<string | null>(null)

  useEffect(() => {
    api.get('/posts')
      .then(r => setPosts(r.data.data ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = posts.filter(p => {
    if (filter === 'all')     return true
    if (filter === 'used')    return p.used
    if (filter === 'liked')   return p.rating === 'liked'
    if (filter === 'disliked') return p.rating === 'disliked'
    return true
  })

  const copyPost = async (post: Post) => {
    await navigator.clipboard.writeText(post.content)
    setCopied(post._id)
    await api.patch(`/posts/${post._id}/used`)
    setTimeout(() => setCopied(null), 2000)
  }

  const deletePost = async (id: string) => {
    await api.delete(`/posts/${id}`)
    setPosts(prev => prev.filter(p => p._id !== id))
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric',
    })

  const filters: { key: Filter; label: string }[] = [
    { key: 'all',      label: 'All' },
    { key: 'used',     label: '✅ Used' },
    { key: 'liked',    label: '👍 Liked' },
    { key: 'disliked', label: '👎 Disliked' },
  ]

 return (
  <div className="page-content animate-in">
    <div className="filter-tabs">
      {(['all', 'used', 'liked', 'disliked'] as Filter[]).map(f => (
        <button
          key={f}
          className={`filter-tab ${filter === f ? 'active' : ''}`}
          onClick={() => setFilter(f)}
        >
          {f === 'all' ? 'All posts' : f === 'used' ? '✅ Used' : f === 'liked' ? '👍 Liked' : '👎 Disliked'}
        </button>
      ))}
    </div>

    {loading ? (
      <div style={{ color: 'var(--text3)', fontSize: '13px' }}>Loading...</div>
    ) : filtered.length === 0 ? (
      <div style={{
        textAlign: 'center', padding: '60px 40px',
        background: 'var(--bg-card)', border: '1px dashed var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}>◷</div>
        <p style={{ color: 'var(--text3)', fontSize: '13px' }}>No posts yet</p>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(post => (
          <div key={post._id} className="history-card">
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                {/* Badges */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--text3)' }}>{formatDate(post.createdAt)}</span>
                  {post.used && <span className="pill pill-green">✅ Used</span>}
                  {post.rating === 'liked' && <span className="pill pill-indigo">👍 Liked</span>}
                  {post.rating === 'disliked' && <span className="pill pill-gray">👎 Disliked</span>}
                  {post.engagementData && (
                    <span className="pill pill-indigo">Score {Math.round(post.engagementData.score)}</span>
                  )}
                </div>

                {/* Content */}
                <p
                  style={{
                    fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6,
                    display: '-webkit-box', WebkitLineClamp: expanded === post._id ? 'unset' : 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}
                >
                  {post.content}
                </p>

                <button
                  onClick={() => setExpanded(expanded === post._id ? null : post._id)}
                  style={{ fontSize: '11.5px', color: 'var(--indigo)', marginTop: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {expanded === post._id ? 'Show less' : 'Show more'}
                </button>

                {/* Engagement */}
                {post.engagementData && (
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
                    gap: '8px', marginTop: '12px',
                    background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '10px',
                  }}>
                    {[
                      { label: 'Likes', val: post.engagementData.likes },
                      { label: 'Comments', val: post.engagementData.comments },
                      { label: 'Reposts', val: post.engagementData.reposts },
                      { label: 'Score', val: Math.round(post.engagementData.score) },
                    ].map(m => (
                      <div key={m.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-head)' }}>{m.val}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Image thumb */}
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border2)' }}
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border2)' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => copyPost(post)}>
                {copied === post._id ? '✅ Copied!' : '📋 Copy'}
              </button>
              <button
                onClick={() => deletePost(post._id)}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                  background: 'none', border: '1px solid var(--border2)',
                  color: '#ef4444', fontSize: '12.5px', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)
}