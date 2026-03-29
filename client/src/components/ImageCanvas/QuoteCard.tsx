import { useEffect, useRef, useState } from 'react'
import api from '../../api/axios'

interface Props {
  text: string
  authorName: string
  authorAvatar?: string
}

const THEMES = {
  dark:  { bg: '#000000', text: '#FFFFFF', sub: '#888888' },
  light: { bg: '#F5F0E8', text: '#1a1a1a', sub: '#666666' },
  blue:  { bg: '#0A66C2', text: '#FFFFFF', sub: '#CCE0F5' },
}

export default function QuoteCard({ text, authorName, authorAvatar }: Props) {
  const canvasRef               = useRef<HTMLCanvasElement>(null)
  const [theme, setTheme]       = useState<'dark' | 'light' | 'blue'>('dark')
  const [quote, setQuote]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [avatarImg, setAvatarImg] = useState<HTMLImageElement | null>(null)

  // Generate a standalone quote from the post content
  const generateQuote = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/generate/quote', { postContent: text })
      if (data.quote) setQuote(data.quote)
    } catch {
      // Fallback — extract a good sentence from the post
      const sentences = text
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 20 && l.length < 120 && !l.startsWith('#'))
      setQuote(sentences[1] ?? sentences[0] ?? text.slice(0, 100))
    } finally {
      setLoading(false)
    }
  }

  // Load avatar image
  useEffect(() => {
    if (!authorAvatar) return
    const img  = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setAvatarImg(img)
    img.src    = authorAvatar
  }, [authorAvatar])

  // Auto-generate quote on mount
  useEffect(() => {
    generateQuote()
  }, [text])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || !quote) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 1080, H = 1080
    canvas.width  = W
    canvas.height = H
    const t = THEMES[theme]

    // Background
    ctx.fillStyle = t.bg
    ctx.fillRect(0, 0, W, H)

    // Quote text — centered, 2-3 lines, smaller font
    const fontSize  = quote.length > 100 ? 44 : quote.length > 60 ? 50 : 56
    ctx.font        = `400 ${fontSize}px Georgia, serif`
    ctx.fillStyle   = t.text
    ctx.textAlign   = 'center'

    // Word wrap
    const words = quote.split(' ')
    const lines: string[] = []
    let cur = ''
    words.forEach(w => {
      const test = cur ? `${cur} ${w}` : w
      if (ctx.measureText(test).width > W - 160 && cur) {
        lines.push(cur); cur = w
      } else cur = test
    })
    if (cur) lines.push(cur)

    // Center vertically — leave space for profile at bottom
    const lineH = fontSize * 1.4
    const total = lines.length * lineH
    let y = (H - total) / 2 - 60 + fontSize

    lines.forEach(l => {
      ctx.fillText(l, W / 2, y)
      y += lineH
    })

    // Profile section at bottom — like Raj Shamani style
    const profileY = H - 160
    const circleX  = W / 2 - 160
    const circleR  = 44

    // Avatar circle
    ctx.save()
    ctx.beginPath()
    ctx.arc(circleX, profileY + circleR, circleR, 0, Math.PI * 2)
    ctx.clip()

    if (avatarImg) {
      ctx.drawImage(
        avatarImg,
        circleX - circleR,
        profileY,
        circleR * 2,
        circleR * 2
      )
    } else {
      // Fallback coloured circle with initial
      ctx.fillStyle = '#0A66C2'
      ctx.fillRect(circleX - circleR, profileY, circleR * 2, circleR * 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.font      = `700 36px Arial`
      ctx.textAlign = 'center'
      ctx.fillText(
        authorName[0]?.toUpperCase() ?? 'U',
        circleX,
        profileY + circleR + 12
      )
    }
    ctx.restore()

    // Name + handle
    ctx.fillStyle = t.text
    ctx.font      = `600 32px Arial, sans-serif`
    ctx.textAlign = 'left'
    ctx.fillText(authorName, circleX + circleR * 2 + 20, profileY + circleR - 4)

    ctx.fillStyle = t.sub
    ctx.font      = `400 24px Arial, sans-serif`
    ctx.fillText('LinkedIn', circleX + circleR * 2 + 20, profileY + circleR + 28)
  }

  useEffect(() => { if (quote) draw() }, [quote, theme, avatarImg])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = 'quote-post.png'
    a.href     = canvas.toDataURL('image/png')
    a.click()
    setDone(true)
    setTimeout(() => setDone(false), 2000)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {(['dark', 'light', 'blue'] as const).map(t => (
          <button key={t} onClick={() => setTheme(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition capitalize ${
              theme === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
            }`}
          >{t}</button>
        ))}
        <button
          onClick={generateQuote}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-purple-200 text-purple-600 hover:bg-purple-50 transition"
        >
          {loading ? '⏳' : '🔄 New quote'}
        </button>
      </div>

      {quote && (
        <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 italic">
          "{quote}"
        </div>
      )}

      <canvas ref={canvasRef} className="w-full rounded-xl border border-gray-200" style={{ aspectRatio: '1/1' }} />

      <button onClick={download}
        className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition"
      >
        {done ? '✅ Downloaded!' : '⬇️ Download image'}
      </button>
    </div>
  )
}