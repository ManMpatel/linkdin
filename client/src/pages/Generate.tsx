import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import EngagementModal from '../components/EngagementModal'
import ImageCanvas from '../components/ImageCanvas/index'



interface Post {
  _id: string
  content: string
  wordCount: number
  charCount: number
}

interface NewsState {
  newsTitle?: string
  newsDescription?: string
}

export default function Generate() {
  const { user }    = useAuth()
  const location    = useLocation()
  const newsState   = location.state as NewsState | null

  const [topic, setTopic]   = useState('')
  const [post, setPost]     = useState<Post | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [rating, setRating] = useState<'liked' | 'disliked' | null>(null)
  const [error, setError]   = useState('')
  const [wantsImage, setWantsImage] = useState(false)
  const [showEngagement, setShowEngagement] = useState(false)
  const [lastScore, setLastScore]           = useState<number | null>(null)
  const [useCreatorStyle, setUseCreatorStyle] = useState(false)
  const [hasCreatorStyle, setHasCreatorStyle] = useState(false)
  const [postFormat, setPostFormat] = useState('auto')


  // Check if creator style exists on load:
  useEffect(() => {
    api.get('/creators')
      .then(r => setHasCreatorStyle(!!r.data.data?.[0]?.styleFingerprint))
      .catch(() => {})
  }, [])


  const generate = async () => {
    setLoading(true)
    setError('')
    setPost(null)
    setRating(null)
    try {
      const { data } = await api.post('/generate', {
        topic:           topic || undefined,
        newsTitle:       newsState?.newsTitle,
        newsDescription: newsState?.newsDescription,
        wantsImage,
        useCreatorStyle,
        postFormat:      postFormat !== 'auto' ? postFormat : undefined,
      })
      if (data.success) setPost(data.data)
    } catch {
      setError('Generation failed — check your API key')
    } finally {
      setLoading(false)
    }
  }


  const copyText = async () => {
  if (!post) return
  await navigator.clipboard.writeText(post.content)
  setCopied(true)
  await api.patch(`/posts/${post._id}/used`)
  setTimeout(() => {
    setCopied(false)
    setShowEngagement(true)  // ← show modal after copy
  }, 1500)
}

  const ratePost = async (r: 'liked' | 'disliked') => {
    if (!post) return
    setRating(r)
    await api.patch(`/posts/${post._id}/rate`, { rating: r })
  }

  const wordCount  = post ? post.content.split(/\s+/).length : 0
  const isOverLimit = wordCount > 400

  return (
  <div className="page-content animate-in">
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '24px', alignItems: 'start' }}>

      {/* LEFT — Input panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* News context */}
        {newsState?.newsTitle && (
          <div style={{
            background: 'var(--indigo-subtle)',
            border: '1px solid var(--indigo-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
          }}>
            <p style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--indigo)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Generating from news</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500, lineHeight: 1.4 }}>{newsState.newsTitle}</p>
          </div>
        )}

        {/* Input card */}
        <div className="card">
          <div className="card-header">
            <span className="card-icon">✦</span>
            <div className="card-title">What do you want to post about?</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label className="field-label">Topic or idea</label>
              <input
                className="input-field"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
                placeholder={`e.g. How AI is changing ${user?.niche ?? 'your industry'}`}
              />
            </div>

            <div>
              <label className="field-label">Post Vibe / Format</label>
              <select
                className="input-field"
                value={postFormat}
                onChange={e => setPostFormat(e.target.value)}
                style={{ padding: '10px', height: '42px' }}
              >
                <option value="auto">Auto (Let AI decide)</option>
                <option value="story">Personal Story / Anecdote</option>
                <option value="unpopular_opinion">Unpopular Opinion / Hot Take</option>
                <option value="behind_the_scenes">Behind the Scenes / Process</option>
                <option value="mistake">Mistake / Lesson Learned</option>
                <option value="rant">Passionate Rant</option>
                <option value="insight">Deep Insight / Framework</option>
              </select>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="toggle-chip">
                <div>
                  <div className="toggle-label">Add image</div>
                  <div className="toggle-sublabel">AI-generated visual</div>
                </div>
                <button
                  onClick={() => setWantsImage(p => !p)}
                  style={{
                    width: '38px', height: '20px', borderRadius: '99px', border: 'none',
                    background: wantsImage ? 'var(--indigo)' : 'var(--border)',
                    position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '2px', left: wantsImage ? '18px' : '2px',
                    width: '16px', height: '16px', borderRadius: '50%', background: 'white',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>

              {hasCreatorStyle && (
                <div className="toggle-chip">
                  <div>
                    <div className="toggle-label">Use creator style</div>
                    <div className="toggle-sublabel">Write in your saved creator vibe</div>
                  </div>
                  <button
                    onClick={() => setUseCreatorStyle(p => !p)}
                    style={{
                      width: '38px', height: '20px', borderRadius: '99px', border: 'none',
                      background: useCreatorStyle ? '#8b5cf6' : 'var(--border)',
                      position: 'relative', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '2px', left: useCreatorStyle ? '18px' : '2px',
                      width: '16px', height: '16px', borderRadius: '50%', background: 'white',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                </div>
              )}
            </div>

            <button
              className="btn-primary"
              onClick={generate}
              disabled={loading || (!topic.trim() && !newsState?.newsTitle)}
            >
              {loading ? '⏳ Generating...' : '✦ Generate post'}
            </button>

            {error && <p style={{ fontSize: '12px', color: '#ef4444' }}>{error}</p>}
          </div>
        </div>

      </div>

      {/* RIGHT — LinkedIn preview */}
      {post ? (
        <div className="card animate-in">
          {/* Header */}
          <div className="li-header">
            <div className="li-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} />
                : user?.name?.[0]}
            </div>
            <div>
              <div className="li-name">{user?.name}</div>
              <div className="li-meta">{user?.niche} · Just now</div>
            </div>
            <span className="niche-badge">{user?.niche}</span>
          </div>

          {/* Editable content */}
          <div style={{ padding: '0 18px 12px' }}>
            <textarea
              value={post.content}
              onChange={e => setPost({ ...post, content: e.target.value })}
              className="input-field"
              style={{ minHeight: '220px', fontSize: '13.5px', lineHeight: '1.7', background: 'transparent', border: 'none', padding: '0', borderRadius: 0 }}
            />
          </div>

          {/* Word counter */}
          <div className="word-counter">
            <div className="counter-track">
              <div
                className={`counter-fill ${wordCount > 400 ? 'over' : wordCount > 350 ? 'warn' : ''}`}
                style={{ width: `${Math.min((wordCount / 400) * 100, 100)}%` }}
              />
            </div>
            <div className="counter-nums">
              <span style={{ color: isOverLimit ? '#ef4444' : 'var(--text3)' }}>
                {wordCount} / 400 words
              </span>
              <span>{post.content.length} / 3,000 chars</span>
            </div>
          </div>

          <div className="li-divider" />

          {/* LinkedIn actions */}
          <div className="li-actions">
            {['👍 Like', '💬 Comment', '🔁 Repost', '✈ Send'].map(a => (
              <div key={a} className="li-action">{a}</div>
            ))}
          </div>

          {/* Copy button */}
          <div style={{ padding: '12px 18px 8px', display: 'flex', gap: '8px' }}>
            <button className="btn-green" onClick={copyText} disabled={isOverLimit}>
              {copied ? '✅ Copied!' : '📋 Copy text'}
            </button>
          </div>

          {/* Rate */}
          <div className="rate-row">
            Was this useful?
            <button
              className={`rate-btn ${rating === 'liked' ? 'liked' : ''}`}
              onClick={() => ratePost('liked')}
            >
              👍 Yes
            </button>
            <button
              className={`rate-btn ${rating === 'disliked' ? 'disliked' : ''}`}
              onClick={() => ratePost('disliked')}
            >
              👎 No
            </button>
          </div>

          {/* Image canvas */}
          {post && (
            <div style={{ padding: '0 18px 18px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>
                Post image
              </div>
              <ImageCanvas
                text={post.content}
                authorName={user?.name ?? 'Author'}
                authorAvatar={user?.avatar}
                postId={post._id}
              />
            </div>
          )}
        </div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)',
          padding: '60px 40px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.3 }}>✦</div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--font-head)' }}>
            Your post will appear here
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '6px' }}>
            Enter a topic and click generate
          </p>
        </div>
      )}

    </div>

    {/* Engagement modal */}
    {showEngagement && post && (
      <EngagementModal
        postId={post._id}
        onClose={() => setShowEngagement(false)}
        onSubmitted={score => { setLastScore(score); setShowEngagement(false) }}
      />
    )}

    {lastScore !== null && (
      <div style={{
        marginTop: '16px', background: 'rgba(16,185,129,0.08)',
        border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)',
        padding: '12px 16px', textAlign: 'center',
      }}>
        <p style={{ color: '#10b981', fontWeight: 600, fontSize: '13px' }}>
          ✅ Stats saved — engagement score: {lastScore}
        </p>
      </div>
    )}
  </div>
)
}