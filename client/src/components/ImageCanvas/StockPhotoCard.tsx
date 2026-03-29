import { useEffect, useRef, useState } from 'react'
import api from '../../api/axios'

interface Props { text: string; authorName: string }

export default function StockPhotoCard({ text, authorName }: Props) {
  const canvasRef               = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [credit, setCredit]     = useState('')

  const getCaption = () => {
    const lines = text.split('\n').map(l => l.trim())
      .filter(l => l.length > 15 && !l.startsWith('#'))
    return lines[0]?.slice(0, 90) ?? text.slice(0, 90)
  }

  const drawCanvas = (imgEl?: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = 1080, H = 1080
    canvas.width = W; canvas.height = H

    if (imgEl) {
      // Draw image covering full canvas
      const scale  = Math.max(W / imgEl.width, H / imgEl.height)
      const sw     = imgEl.width * scale
      const sh     = imgEl.height * scale
      ctx.drawImage(imgEl, (W - sw) / 2, (H - sh) / 2, sw, sh)
    } else {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, W, H)
    }

    // Dark gradient overlay at bottom
    const grad = ctx.createLinearGradient(0, H * 0.5, 0, H)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(1, 'rgba(0,0,0,0.82)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Caption text
    const caption  = getCaption()
    const fontSize = caption.length > 70 ? 44 : caption.length > 45 ? 52 : 60
    ctx.font       = `600 ${fontSize}px Georgia, serif`
    ctx.fillStyle  = '#ffffff'
    ctx.textAlign  = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur  = 10

    const words = caption.split(' ')
    const lines: string[] = []
    let cur = ''
    words.forEach(w => {
      const test = cur ? `${cur} ${w}` : w
      if (ctx.measureText(test).width > W - 120 && cur) { lines.push(cur); cur = w }
      else cur = test
    })
    if (cur) lines.push(cur)

    const lineH = fontSize * 1.35
    let y = H - 180 - lines.length * lineH + fontSize
    lines.forEach(l => { ctx.fillText(l, W / 2, y); y += lineH })

    ctx.shadowBlur = 0

    // Author
    ctx.font      = `400 26px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText(`— ${authorName}`, W / 2, H - 60)

    // Photo credit
    if (credit) {
      ctx.font      = `300 18px Arial`
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.textAlign = 'right'
      ctx.fillText(`Photo: ${credit} / Unsplash`, W - 20, H - 20)
    }
  }

  const fetchPhoto = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/generate/stock-image', { postContent: text })
      if (data.imageUrl) {
        setPhotoUrl(data.imageUrl)
        setCredit(data.credit ?? '')
        const img        = new Image()
        img.crossOrigin  = 'anonymous'
        img.onload       = () => { drawCanvas(img); setLoading(false) }
        img.onerror      = () => { drawCanvas(); setLoading(false) }
        img.src          = data.imageUrl
      } else {
        drawCanvas()
        setLoading(false)
      }
    } catch {
      drawCanvas()
      setLoading(false)
    }
  }

  useEffect(() => { fetchPhoto() }, [text])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = 'stock-post.png'; a.href = canvas.toDataURL('image/png'); a.click()
    setDone(true); setTimeout(() => setDone(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {loading && (
        <div style={{ fontSize: '12px', color: 'var(--text3)', padding: '8px 0' }}>
          🔍 Finding relevant photo...
        </div>
      )}
      <canvas ref={canvasRef} style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={fetchPhoto} disabled={loading}
          style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'var(--indigo-subtle)', color: 'var(--indigo)', border: '1px solid var(--indigo-border)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
          🔄 New photo
        </button>
        <button onClick={download}
          style={{ flex: 1, padding: '9px', borderRadius: '8px', background: '#111', color: 'white', border: 'none', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
          {done ? '✅' : '⬇️ Download'}
        </button>
      </div>
    </div>
  )
}