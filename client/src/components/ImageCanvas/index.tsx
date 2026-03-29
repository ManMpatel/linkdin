import QuoteCard        from './QuoteCard'
import InfographicCard  from './InfographicCard'
import IllustratedCard  from './IllustratedCard'
import StockPhotoCard   from './StockPhotoCard' 
import StatCard         from './StatCard'

interface Props {
  text: string
  authorName: string
  authorAvatar?: string
  postId: string
}

export type ImageStyle = 'quote' | 'stock' | 'illustrated' | 'infographic' | 'stat'

// Rotate by day of week — 5 styles, 7 days
const SCHEDULE: ImageStyle[] = [
  'quote',        // Sunday
  'stat',         // Monday
  'stock',        // Tuesday
  'infographic',  // Wednesday
  'illustrated',  // Thursday
  'quote',        // Friday
  'stock',        // Saturday
]

const STYLE_LABELS: Record<ImageStyle, string> = {
  quote:       '💬 Quote card',
  stock:       '📸 Stock photo',
  illustrated: '🎨 AI illustration',
  infographic: '📊 Infographic',
  stat:        '🔢 Bold stat',
}

export default function ImageCanvas({ text, authorName, authorAvatar, postId }: Props) {
  const day   = new Date().getDay()
  const style = SCHEDULE[day]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* Style indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: '11px', color: 'var(--text3)',
      }}>
        <span>Today: <strong style={{ color: 'var(--indigo)' }}>{STYLE_LABELS[style]}</strong></span>
        <span style={{ fontSize: '10px' }}>Rotates daily</span>
      </div>

      {style === 'quote'       && <QuoteCard       text={text} authorName={authorName} authorAvatar={authorAvatar} />}
      {style === 'stock'       && <StockPhotoCard   text={text} authorName={authorName} />}
      {style === 'illustrated' && <IllustratedCard  text={text} authorName={authorName} postId={postId} />}
      {style === 'infographic' && <InfographicCard  text={text} authorName={authorName} />}
      {style === 'stat'        && <StatCard         text={text} authorName={authorName} authorAvatar={authorAvatar} />}

    </div>
  )
}
