import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

interface Post {
  _id: string
  content: string
  used: boolean
  createdAt: string
}

export default function Dashboard() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [post, setPost]     = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/generate/today')
      .then(r => setPost(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-content animate-in">

      {/* Stats */}
      <div className="stats-grid">
        {[
          { icon: '✦', num: '47',   label: 'Posts generated', change: '↑ 12 this week' },
          { icon: '🔥', num: String(user?.currentStreak ?? 0), label: 'Day streak', change: `Best: ${user?.longestStreak ?? 0}` },
          { icon: '◈', num: '186',  label: 'Avg eng. score',  change: '↑ 23 from last week' },
          { icon: '◎', num: '4.2k', label: 'Est. impressions', change: '↑ 18% this month' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change">{s.change}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Today's post */}
        <div className="card">
          <div className="card-header">
            <span className="card-icon">◷</span>
            <div className="card-title">Today's post</div>
            {post && (
              <span className="pill pill-green" style={{ marginLeft: 'auto' }}>
                Ready
              </span>
            )}
          </div>
          <div className="card-body">
            {loading ? (
              <div style={{ color: 'var(--text3)', fontSize: '13px' }}>Loading...</div>
            ) : post ? (
              <>
                <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.65', marginBottom: '14px' }}>
                  {post.content.slice(0, 180)}...
                </p>
                <button className="btn-primary" onClick={() => navigate('/generate')}>
                  View + Copy post →
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '14px' }}>
                  No post yet — generate one now
                </p>
                <button className="btn-primary" onClick={() => navigate('/generate')}>
                  ✦ Generate today's post
                </button>
              </>
            )}
          </div>
        </div>

        {/* Insights */}
        <div className="card">
          <div className="card-header">
            <span className="card-icon">◈</span>
            <div className="card-title">What's working</div>
            <span style={{ marginLeft: 'auto', fontSize: '10.5px', color: 'var(--text3)' }}>
              3 weeks of data
            </span>
          </div>
          <div className="card-body">
            <div className="insight-grid">
              {[
                { icon: '⚡', val: 'Bold claim', label: 'Best hook' },
                { icon: '📖', val: 'Story',      label: 'Best format' },
                { icon: '#',  val: '#AItools',   label: 'Top hashtag' },
              ].map(i => (
                <div key={i.label} className="insight-chip">
                  <div className="insight-chip-icon">{i.icon}</div>
                  <div className="insight-chip-val">{i.val}</div>
                  <div className="insight-chip-label">{i.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginTop: '20px' }}>
        {[
          { icon: '✦', label: 'Generate post', sub: 'Custom topic', path: '/generate' },
          { icon: '◈', label: 'From news',     sub: "Today's headlines", path: '/news' },
          { icon: '◷', label: 'My history',    sub: 'Past posts', path: '/history' },
        ].map(a => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: 'var(--shadow)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--indigo)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>{a.icon}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '13.5px', fontWeight: 600, color: 'var(--text)' }}>{a.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '3px' }}>{a.sub}</div>
          </button>
        ))}
      </div>

    </div>
  )
}