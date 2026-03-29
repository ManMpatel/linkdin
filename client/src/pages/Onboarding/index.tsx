import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

import Step0_Region   from './Step0_Region'
import Step1_Niche    from './Step1_Niche'
import Step2_Tone     from './Step2_Tone'
import Step3_Goal     from './Step3_Goal'
import Step4_Creators from './Step4_Creators'
import Step5_Schedule from './Step5_Schedule'

export interface OnboardingData {
  region: string
  niche: string
  tone: string
  goal: string
  postTime: string
  globalAudience: boolean
}

const TOTAL_STEPS = 5

export default function Onboarding() {
  const navigate = useNavigate()
  const { refetchUser } = useAuth()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    region: 'AU',
    niche: '',
    tone: 'professional',
    goal: '',
    postTime: '07:00',
    globalAudience: true,
  })

  const update = (fields: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...fields }))
  }

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const finish = async () => {
    setSaving(true)
    try {
      await api.patch('/auth/onboarding', data)
      await refetchUser()
      navigate('/dashboard')
    } catch (err) {
      console.error('Onboarding save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    <Step0_Region   data={data} update={update} onNext={next} />,
    <Step1_Niche    data={data} update={update} onNext={next} onBack={back} />,
    <Step2_Tone     data={data} update={update} onNext={next} onBack={back} />,
    <Step3_Goal     data={data} update={update} onNext={next} onBack={back} />,
    <Step4_Creators onNext={next} onBack={back} onSkip={next} />,
    <Step5_Schedule data={data} update={update} onFinish={finish} onBack={back} saving={saving} />,
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Step {step + 1} of {TOTAL_STEPS + 1}</span>
          <span>{Math.round(((step + 1) / (TOTAL_STEPS + 1)) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / (TOTAL_STEPS + 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="w-full max-w-md">
        {steps[step]}
      </div>
    </div>
  )
}