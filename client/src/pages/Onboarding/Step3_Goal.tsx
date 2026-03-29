import type { OnboardingData } from './index'

const goals = [
  { value: 'clients',    label: '🤝 Get clients',      desc: 'Attract leads and customers' },
  { value: 'followers',  label: '📈 Grow followers',   desc: 'Build a larger audience' },
  { value: 'brand',      label: '🌟 Build my brand',   desc: 'Establish thought leadership' },
  { value: 'visibility', label: '👀 Get visibility',   desc: 'Be seen in my industry' },
]

interface Props { data: OnboardingData; update: (f: Partial<OnboardingData>) => void; onNext: () => void; onBack: () => void }

export default function Step3_Goal({ data, update, onNext, onBack }: Props) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-1">What's your goal?</h2>
      <p className="text-gray-400 text-sm mb-6">This shapes what your posts focus on</p>

      <div className="flex flex-col gap-3 mb-6">
        {goals.map((g) => (
          <button
            key={g.value}
            onClick={() => update({ goal: g.value })}
            className={`p-4 rounded-xl border text-left transition ${
              data.goal === g.value
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-900 text-sm">{g.label}</div>
            <div className="text-gray-400 text-xs mt-0.5">{g.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition">Back</button>
        <button onClick={onNext} disabled={!data.goal} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-40">Continue</button>
      </div>
    </div>
  )
}