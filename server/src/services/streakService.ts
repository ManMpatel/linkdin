import User from '../models/User'

export const incrementStreak = async (userId: string): Promise<void> => {
  try {
    const user = await User.findById(userId)
    if (!user) return

    const now       = new Date()
    const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Check if already incremented today
    const lastUsed = user.updatedAt
      ? new Date(user.updatedAt)
      : null

    if (lastUsed) {
      const lastUsedDay = new Date(
        lastUsed.getFullYear(),
        lastUsed.getMonth(),
        lastUsed.getDate()
      )
      // Already counted today
      if (lastUsedDay.getTime() === today.getTime()) return
    }

    const newStreak  = (user.currentStreak ?? 0) + 1
    const longest    = Math.max(newStreak, user.longestStreak ?? 0)

    await User.findByIdAndUpdate(userId, {
      currentStreak: newStreak,
      longestStreak: longest,
    })

    console.log(`✅ Streak updated: ${newStreak} days`)
  } catch (error) {
    console.error('Streak increment error:', error)
  }
}

export const resetStreak = async (userId: string): Promise<void> => {
  try {
    await User.findByIdAndUpdate(userId, { currentStreak: 0 })
    console.log(`🔄 Streak reset for user ${userId}`)
  } catch (error) {
    console.error('Streak reset error:', error)
  }
}