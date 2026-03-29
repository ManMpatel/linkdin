interface Props {
  content: string
}

export default function CharCounter({ content }: Props) {
  const words = content.trim() ? content.split(/\s+/).length : 0
  const chars = content.length
  const isOverWords = words > 400
  const isOverChars = chars > 3000

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className={isOverWords ? 'text-red-500' : 'text-gray-400'}>
          {words} / 400 words
        </span>
        <span className={isOverChars ? 'text-red-500' : 'text-gray-400'}>
          {chars} / 3000 chars
        </span>
      </div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isOverWords ? 'bg-red-500' :
            words > 350  ? 'bg-amber-400' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min((words / 400) * 100, 100)}%` }}
        />
      </div>
    </div>
  )
}