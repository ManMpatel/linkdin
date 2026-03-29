import { useEffect, useRef, useState } from 'react'
import api from '../../api/axios'

interface Props {
  text: string
  authorName: string
  postId: string
}

export default function IllustratedCard({ text, authorName, postId }: Props) {
  const canvasRef       = useRef<HTMLCanvasElement>(null)
  const [imgSrc, setImgSrc]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const getTitle = () => {
    const lines = text.split('\n').map(l => l.trim()).filter(l =>
      l.length > 10 && !l.startsWith('#')
    )
    return lines[0]?.slice(0, 80) ?? 'Key Insight'
  }

  const drawOverlay = (bgImage?: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = 1080, H = 1080
    canvas.width = W
    canvas.height = H

    // Draw background
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, W, H)
      // Dark overlay for readability
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(0, 0, W, H)
    } else {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, W, H)
    }

    // Title text with wrap
    const title    = getTitle()
    const fontSize = title.length > 60 ? 58 : title.length > 40 ? 68 : 78
    ctx.font       = `700 ${fontSize}px Georgia, serif`
    ctx.fillStyle  = '#FFFFFF'
    ctx.textAlign  = 'center'
    ctx.shadowColor   = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur    = 20

    const words = title.split(' ')
    const lines: string[] = []
    let cur = ''
    words.forEach(w => {
      const test = cur ? `${cur} ${w}` : w
      if (ctx.measureText(test).width > W - 120 && cur) {
        lines.push(cur); cur = w
      } else cur = test
    })
    if (cur) lines.push(cur)

    const lineH = fontSize * 1.3
    const total = lines.length * lineH
    let y = (H - total) / 2 + fontSize

    lines.forEach(l => { ctx.fillText(l, W / 2, y); y += lineH })

    ctx.shadowBlur = 0

    // Author + profile section at bottom
    ctx.fillStyle   = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, H - 110, W, 110)

    ctx.font      = `500 28px Arial, sans-serif`
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.fillText(authorName, W / 2, H - 58)

    ctx.font      = `400 22px Arial, sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText('LinkedIn', W / 2, H - 28)
  }

  // Generate Imagen background
  const generateBackground = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/generate/image-only', {
        postContent: text,
      })
      if (data.imageUrl) {
        setImgSrc(data.imageUrl)
        const img    = new Image()
        img.onload   = () => drawOverlay(img)
        img.src      = data.imageUrl
      } else {
        drawOverlay()
      }
    } catch {
      drawOverlay()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { drawOverlay() }, [text])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = 'illustrated-post.png'
    a.href     = canvas.toDataURL('image/png')
    a.click()
    setDone(true)
    setTimeout(() => setDone(false), 2000)
  }

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl border border-gray-200"
        style={{ aspectRatio: '1/1' }}
      />
      <div className="flex gap-2">
        <button
          onClick={generateBackground}
          disabled={loading}
          className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-purple-700 transition disabled:opacity-40"
        >
          {loading ? '⏳ Generating...' : '🎨 Generate AI background'}
        </button>
        <button
          onClick={download}
          className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition"
        >
          {done ? '✅ Done!' : '⬇️ Download'}
        </button>
      </div>
      <p className="text-gray-400 text-xs text-center">
        Click "Generate AI background" to add an illustration behind the text
      </p>
    </div>
  )
}
