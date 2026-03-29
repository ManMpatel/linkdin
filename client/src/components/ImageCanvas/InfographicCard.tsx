import { useEffect, useRef, useState } from 'react'

interface Props {
  text: string
  authorName: string
}

const THEMES = {
  cream:  { bg: '#F5F0E8', header: '#1a1a1a', item: '#2d2d2d', accent: '#C0392B', sub: '#555555', line: '#dddddd' },
  dark:   { bg: '#1a1a2e', header: '#FFFFFF', item: '#FFFFFF', accent: '#4FC3F7', sub: '#AAAAAA', line: '#333355' },
  white:  { bg: '#FFFFFF', header: '#0A66C2', item: '#1a1a1a', accent: '#0A66C2', sub: '#666666', line: '#eeeeee' },
}

export default function InfographicCard({ text, authorName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [theme, setTheme] = useState<'cream' | 'dark' | 'white'>('cream')
  const [done, setDone]   = useState(false)

  const parseContent = () => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

    // Find title — first non-hashtag line
    const title = lines.find(l => !l.startsWith('#') && l.length > 5) ?? 'Key Insights'

    // Find numbered items
    const items = lines
      .filter(l => /^\d+\./.test(l) || l.startsWith('- ') || l.startsWith('• '))
      .slice(0, 7)
      .map(l => l.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, ''))

    // If no numbered items found — split into chunks
    if (items.length === 0) {
      const chunks = lines.filter(l => !l.startsWith('#') && l.length > 10).slice(0, 5)
      return { title, items: chunks }
    }

    return { title, items }
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 1080, H = 1350
    canvas.width = W
    canvas.height = H
    const t = THEMES[theme]
    const { title, items } = parseContent()

    // Background
    ctx.fillStyle = t.bg
    ctx.fillRect(0, 0, W, H)

    // Top accent bar
    ctx.fillStyle = t.accent
    ctx.fillRect(0, 0, W, 12)

    // Title
    const titleSize = title.length > 40 ? 52 : 62
    ctx.font        = `700 ${titleSize}px Georgia, serif`
    ctx.fillStyle   = t.header
    ctx.textAlign   = 'center'

    // Wrap title
    const titleWords = title.split(' ')
    const titleLines: string[] = []
    let cur = ''
    titleWords.forEach(w => {
      const test = cur ? `${cur} ${w}` : w
      if (ctx.measureText(test).width > W - 120 && cur) {
        titleLines.push(cur); cur = w
      } else cur = test
    })
    if (cur) titleLines.push(cur)

    let y = 100
    titleLines.forEach(l => {
      ctx.fillText(l, W / 2, y)
      y += titleSize * 1.3
    })

    y += 30

    // Divider
    ctx.fillStyle   = t.accent
    ctx.fillRect(W / 2 - 60, y, 120, 4)
    y += 50

    // Items
    const itemH = Math.min(140, (H - y - 100) / Math.max(items.length, 1))

    items.forEach((item, i) => {
      // Number circle
      ctx.beginPath()
      ctx.arc(90, y + 20, 28, 0, Math.PI * 2)
      ctx.fillStyle = t.accent
      ctx.fill()

      ctx.font      = `700 26px Arial, sans-serif`
      ctx.fillStyle = '#FFFFFF'
      ctx.textAlign = 'center'
      ctx.fillText(`${i + 1}`, 90, y + 29)

      // Item text
      ctx.textAlign = 'left'
      const itemFontSize = 32
      ctx.font      = `700 ${itemFontSize}px Arial, sans-serif`
      ctx.fillStyle = t.item

      // Wrap item text
      const maxW     = W - 180
      const itemWords = item.split(' ')
      const iLines: string[] = []
      let ic = ''
      itemWords.forEach(w => {
        const test = ic ? `${ic} ${w}` : w
        if (ctx.measureText(test).width > maxW && ic) {
          iLines.push(ic); ic = w
        } else ic = test
      })
      if (ic) iLines.push(ic)

      iLines.forEach((l, li) => {
        ctx.fillText(l, 140, y + (li === 0 ? 30 : 30 + li * 38))
      })

      y += itemH

      // Divider line
      if (i < items.length - 1) {
        ctx.fillStyle   = t.line
        ctx.fillRect(80, y - 15, W - 160, 1)
      }
    })

    // Author
    ctx.font      = `400 26px Arial, sans-serif`
    ctx.fillStyle = t.sub
    ctx.textAlign = 'center'
    ctx.fillText(`— ${authorName}`, W / 2, H - 50)

    // Bottom accent
    ctx.fillStyle = t.accent
    ctx.fillRect(0, H - 12, W, 12)
  }

  useEffect(() => { draw() }, [text, theme])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = 'infographic-post.png'
    a.href     = canvas.toDataURL('image/png')
    a.click()
    setDone(true)
    setTimeout(() => setDone(false), 2000)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['cream', 'dark', 'white'] as const).map(t => (
          <button key={t} onClick={() => setTheme(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition capitalize ${
              theme === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} className="w-full rounded-xl border border-gray-200" />
      <button onClick={download}
        className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition"
      >
        {done ? '✅ Downloaded!' : '⬇️ Download image'}
      </button>
    </div>
  )
}