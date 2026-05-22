import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const PLANS = [
  { id: 'free',    label: 'Free',    price: 0,   devices: 1,  desc: 'Try it out. 1 device, no team.' },
  { id: 'starter', label: 'Starter', price: 29,  devices: 5,  desc: 'Small IT teams. 5 devices, PDF reports.' },
  { id: 'growth',  label: 'Growth',  price: 79,  devices: 20, desc: 'Growing orgs. 20 devices, team seats.' },
  { id: 'team',    label: 'Team',    price: 149, devices: 50, desc: '50 devices, API access, priority support.' },
]

export default function Onboarding() {
  const [step, setStep]       = useState(1)
  const [orgName, setOrgName] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('free')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleFinish() {
    setLoading(true)
    try {
      // Update org name if changed
      if (orgName.trim()) {
        await api.put('/orgs/me', { name: orgName.trim() })
      }

      if (selectedPlan === 'free') {
        // Go straight to dashboard
        navigate('/dashboard')
      } else {
        // Start Stripe checkout
        const res = await api.post(`/billing/checkout?plan=${selectedPlan}`)
        window.location.href = res.data.url
      }
    } catch (err) {
      console.error(err)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= s ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}>{s}</div>
              {s < 2 && <div className={`flex-1 h-0.5 w-12 ${step > s ? 'bg-blue-500' : 'bg-slate-700'}`} />}
            </div>
          ))}
          <span className="text-slate-400 text-sm ml-2">Step {step} of 2</span>
        </div>

        {/* ── Step 1: Organization name ── */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Name your workspace</h1>
            <p className="text-slate-400 mb-6">This is how your organization will appear in reports and invoices.</p>

            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-1.5">Organization name</label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="Acme IT Security"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-base"
                onKeyDown={e => e.key === 'Enter' && orgName.trim() && setStep(2)}
                autoFocus
              />
              <p className="text-slate-500 text-xs mt-1.5">You can change this later in Settings.</p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Pick a plan ── */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Choose your plan</h1>
            <p className="text-slate-400 mb-6">Start free and upgrade when you need more devices or team seats.</p>

            <div className="space-y-3 mb-6">
              {PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{plan.label}</span>
                      {plan.id === 'growth' && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Popular</span>
                      )}
                      {plan.id === 'free' && (
                        <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full">No card needed</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mt-0.5">{plan.desc}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    {plan.price === 0 ? (
                      <span className="text-white font-bold text-lg">Free</span>
                    ) : (
                      <>
                        <span className="text-white font-bold text-lg">${plan.price}</span>
                        <span className="text-slate-400 text-sm">/mo</span>
                      </>
                    )}
                    <p className="text-slate-500 text-xs">{plan.devices} devices</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-sm"
              >
                ← Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? 'Setting up…' :
                 selectedPlan === 'free' ? 'Go to dashboard →' :
                 `Start ${PLANS.find(p => p.id === selectedPlan)?.label} plan →`}
              </button>
            </div>

            {selectedPlan !== 'free' && (
              <p className="text-center text-slate-500 text-xs mt-3">
                You'll be redirected to Stripe to enter payment details. Cancel anytime.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
