import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

interface Article {
  title: string
  description: string
  url: string
  source: { name: string }
  publishedAt: string
  urlToImage: string | null
}

export default function News() {
  const navigate              = useNavigate()
  const { user }              = useAuth()          // ← moved inside
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/news')
      .then(r => setArticles(r.data.data ?? []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [])

  const generateFromNews = (article: Article) => {
    navigate('/generate', {
      state: {
        newsTitle:       article.title,
        newsDescription: article.description,
      },
    })
  }

  return (
    <div className="page-content animate-in">

      {/* Personalisation indicator */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: 'var(--indigo-subtle)', border: '1px solid var(--indigo-border)',
        borderRadius: '99px', padding: '4px 12px', marginBottom: '16px',
        fontSize: '11.5px', color: 'var(--indigo)', fontWeight: 500,
      }}>
        ✦ Personalised for {user?.niche} · {user?.region} · {user?.goal}
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '20px' }}>
        Turn today's trending headlines into LinkedIn posts
      </p>

      {loading ? (
        <div style={{ color: 'var(--text3)', fontSize: '13px' }}>Fetching news...</div>
      ) : articles.length === 0 ? (
        <div style={{ color: 'var(--text3)', fontSize: '13px' }}>
          No news found — check your NewsAPI key in .env
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {articles.map((article, i) => (
            <div key={i} className="news-card">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
                    <span className="news-source-badge">{article.source.name}</span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text3)' }}>
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.45, marginBottom: '6px', fontFamily: 'var(--font-head)' }}>
                    {article.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text3)', lineHeight: 1.55 }}>
                    {article.description}
                  </p>
                </div>
                {article.urlToImage && (
                  <img
                    src={article.urlToImage}
                    style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border2)' }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>
              <button
                onClick={() => generateFromNews(article)}
                style={{
                  marginTop: '12px', width: '100%', padding: '8px',
                  borderRadius: 'var(--radius-sm)', background: 'var(--indigo-subtle)',
                  color: 'var(--indigo)', border: '1px solid var(--indigo-border)',
                  fontSize: '12.5px', fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'var(--font-head)', transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--indigo-subtle)')}
              >
                ✦ Write post from this →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


