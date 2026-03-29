import type { OnboardingData } from './index'

const regions = [
  { code: 'AU', label: '🇦🇺 Australia' },
  { code: 'US', label: '🇺🇸 United States' },
  { code: 'IN', label: '🇮🇳 India' },
  { code: 'GB', label: '🇬🇧 United Kingdom' },
  { code: 'SG', label: '🇸🇬 Singapore' },
  { code: 'CA', label: '🇨🇦 Canada' },
  { code: 'NZ', label: '🇳🇿 New Zealand' },
  { code: 'AE', label: '🇦🇪 UAE' },
]

interface Props { data: OnboardingData; update: (f: Partial<OnboardingData>) => void; onNext: () => void }

export default function Step0_Region({ data, update, onNext }: Props) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Where are you based?</h2>
      <p className="text-gray-400 text-sm mb-6">We'll personalise news and hashtags for your region</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {regions.map((r) => (
          <button
            key={r.code}
            onClick={() => update({ region: r.code })}
            className={`p-3 rounded-xl border text-sm font-medium transition ${
              data.region === r.code
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!data.region}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  )
}