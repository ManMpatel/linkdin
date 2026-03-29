import type { OnboardingData } from './index'

interface Props {
  data: OnboardingData
  update: (f: Partial<OnboardingData>) => void
  onFinish: () => void
  onBack: () => void
  saving: boolean
}

export default function Step5_Schedule({ data, update, onFinish, onBack, saving }: Props) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-1">When should your post arrive?</h2>
      <p className="text-gray-400 text-sm mb-6">
        We'll generate your post fresh every morning at this time
      </p>

      <div className="mb-6">
        <label className="text-sm text-gray-600 font-medium mb-2 block">
          Daily post time
        </label>
        <input
          type="time"
          value={data.postTime}
          onChange={(e) => update({ postTime: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-400"
        />
        <p className="text-gray-400 text-xs mt-2">
          Default is 7:00 AM your local time
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <p className="text-blue-700 text-sm font-medium">You're all set! 🎉</p>
        <p className="text-blue-500 text-xs mt-1">
          Your first post will be generated right after setup
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition">Back</button>
        <button
          onClick={onFinish}
          disabled={saving}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Finish setup →'}
        </button>
      </div>
    </div>
  )
}