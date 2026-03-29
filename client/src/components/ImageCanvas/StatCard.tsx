import { useEffect, useRef, useState } from 'react'
import api from '../../api/axios'

interface Props { text: string; authorName: string; authorAvatar?: string }

const THEMES = [
  { bg: '#0f0f0f', accent: '#6366f1', text: '#ffffff' },
  { bg: '#0a0a1a', accent: '#8b5cf6', text: '#ffffff' },
  { bg: '#06051a', accent: '#a78bfa', text: '#ffffff' },
]

export default function StatCard({ text, authorName, authorAvatar }: Props) {
  const canvasRef               = useRef<HTMLCanvasElement>(null)
  const [stat, setStat]         = useState<{ number: string; context: string } | null>(null)
  const [theme, setTheme]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [avatarImg, setAvatarImg] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!authorAvatar) return
    const img = new Image(); img.crossOrigin = 'anonymous'
    img.onload = () => setAvatarImg(img)
    img.src    = authorAvatar
  }, [authorAvatar])

  const extractStat = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/generate/extract-stat', { postContent: text })
      setStat(data.stat)
    } catch {
      setStat({ number: '3×', context: 'More impact with the right approach' })
    } finally {
      setLoading(false)
    }
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || !stat) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = 1080, H = 1080
    canvas.width = W; canvas.height = H
    const t = THEMES[theme]

    ctx.fillStyle = t.bg
    ctx.fillRect(0, 0, W, H)

    // Accent circle behind stat
    ctx.beginPath()
    ctx.arc(W / 2, H / 2 - 60, 200, 0, Math.PI * 2)
    ctx.fillStyle = t.accent + '15'
    ctx.fill()

    // Big number
    ctx.font      = `700 160px 'Bricolage Grotesque', Georgia, sans-serif`
    ctx.fillStyle = t.accent
    ctx.textAlign = 'center'
    ctx.fillText(stat.number, W / 2, H / 2 + 20)

    // Context line
    ctx.font      = `400 44px Georgia, serif`
    ctx.fillStyle = t.text
    ctx.globalAlpha = 0.85
    ctx.fillText(stat.context, W / 2, H / 2 + 100)
    ctx.globalAlpha = 1

    // Divider
    ctx.fillStyle = t.accent
    ctx.fillRect(W / 2 - 40, H / 2 + 130, 80, 3)

    // Author
    if (avatarImg) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(W / 2 - 80, H - 130, 28, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(avatarImg, W / 2 - 108, H - 158, 56, 56)
      ctx.restore()
    }
    ctx.font      = `500 28px Arial`
    ctx.fillStyle = t.text
    ctx.textAlign = 'left'
    ctx.fillText(authorName, W / 2 - 40, H - 115)
    ctx.font      = `400 22px Arial`
    ctx.fillStyle = t.accent
    ctx.fillText('LinkedIn', W / 2 - 40, H - 85)
  }

  useEffect(() => { if (stat) draw() }, [stat, theme, avatarImg])
  useEffect(() => { extractStat() }, [text])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = 'stat-post.png'; a.href = canvas.toDataURL('image/png'); a.click()
    setDone(true); setTimeout(() => setDone(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {loading && <div style={{ fontSize: '12px', color: 'var(--text3)' }}>🔢 Extracting key stat...</div>}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
        {THEMES.map((t, i) => (
          <div key={i} onClick={() => setTheme(i)} style={{
            width: '24px', height: '24px', borderRadius: '6px', background: t.bg,
            border: theme === i ? `2px solid ${t.accent}` : '2px solid transparent',
            cursor: 'pointer', flexShrink: 0,
          }} />
        ))}
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={extractStat} disabled={loading}
          style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'var(--indigo-subtle)', color: 'var(--indigo)', border: '1px solid var(--indigo-border)', fontSize: '12px', cursor: 'pointer' }}>
          🔄 Regenerate
        </button>
        <button onClick={download}
          style={{ flex: 1, padding: '9px', borderRadius: '8px', background: '#111', color: 'white', border: 'none', fontSize: '12px', cursor: 'pointer' }}>
          {done ? '✅' : '⬇️ Download'}
        </button>
      </div>
    </div>
  )
}