interface Props {
  streak: number
  longest: number
}

export default function StreakBadge({ streak, longest }: Props) {
  if (streak === 0) return null

  return (
    <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
      <span className="text-2xl">🔥</span>
      <div>
        <div className="font-semibold text-orange-700 text-sm">
          {streak} day streak!
        </div>
        <div className="text-orange-400 text-xs">
          Best: {longest} days
        </div>
      </div>
    </div>
  )
}