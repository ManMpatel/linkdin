import type { OnboardingData } from './index'

const tones = [
  { value: 'professional', label: '💼 Professional', desc: 'Formal, credible, polished' },
  { value: 'bold',         label: '🔥 Bold',         desc: 'Direct, confident, punchy' },
  { value: 'storytelling', label: '📖 Storytelling', desc: 'Narrative, relatable, human' },
  { value: 'casual',       label: '😊 Casual',       desc: 'Friendly, conversational' },
]

interface Props { data: OnboardingData; update: (f: Partial<OnboardingData>) => void; onNext: () => void; onBack: () => void }

export default function Step2_Tone({ data, update, onNext, onBack }: Props) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-1">What's your tone?</h2>
      <p className="text-gray-400 text-sm mb-6">How should your posts sound?</p>

      <div className="flex flex-col gap-3 mb-6">
        {tones.map((t) => (
          <button
            key={t.value}
            onClick={() => update({ tone: t.value })}
            className={`p-4 rounded-xl border text-left transition ${
              data.tone === t.value
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-900 text-sm">{t.label}</div>
            <div className="text-gray-400 text-xs mt-0.5">{t.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition">Back</button>
        <button onClick={onNext} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">Continue</button>
      </div>
    </div>
  )
}