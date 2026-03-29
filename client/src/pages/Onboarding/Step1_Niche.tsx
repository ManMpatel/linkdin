import type { OnboardingData } from './index'

const niches = ['AI', 'Fitness', 'Business', 'Startup', 'Finance', 'Marketing', 'Leadership', 'Tech', 'Other']

interface Props { data: OnboardingData; update: (f: Partial<OnboardingData>) => void; onNext: () => void; onBack: () => void }

export default function Step1_Niche({ data, update, onNext, onBack }: Props) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-1">What's your niche?</h2>
      <p className="text-gray-400 text-sm mb-6">Your posts will be tailored to this topic</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {niches.map((n) => (
          <button
            key={n}
            onClick={() => update({ niche: n })}
            className={`p-3 rounded-xl border text-sm font-medium transition ${
              data.niche === n
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition">Back</button>
        <button onClick={onNext} disabled={!data.niche} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-40">Continue</button>
      </div>
    </div>
  )
}