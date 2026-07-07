import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { extractApiErrorMessage } from '../api'

const PLANS = [
  {
    id:      'starter',
    name:    'Starter',
    price:   29,
    devices: 5,
    features: ['Up to 5 devices', 'Scheduled scans', 'PDF reports', 'Email alerts', '2 team seats'],
  },
  {
    id:      'growth',
    name:    'Growth',
    price:   79,
    devices: 20,
    popular: true,
    features: ['Up to 20 devices', 'Everything in Starter', '5 team seats', 'Slack integration', 'Priority support'],
  },
  {
    id:      'team',
    name:    'Team',
    price:   149,
    devices: 50,
    features: ['Up to 50 devices', 'Everything in Growth', 'Unlimited seats', 'API access', 'Custom checks'],
  },
]

export default function Billing() {
  const [status, setStatus]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [upgrading, setUpgrading] = useState(null)
  const [searchParams]           = useSearchParams()

  const checkoutResult = searchParams.get('checkout')

  useEffect(() => {
    fetchStatus()
  }, [])

  async function fetchStatus() {
    try {
      const res = await api.get('/billing/status')
      setStatus(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpgrade(planId) {
    setUpgrading(planId)
    try {
      const res = await api.post(`/billing/checkout?plan=${planId}`)
      // Redirect to Stripe
      window.location.href = res.data.url
    } catch (err) {
      alert(extractApiErrorMessage(err) || 'Billing error - please try again')
    } finally {
      setUpgrading(null)
    }
  }

  async function handleManage() {
    try {
      const res = await api.post('/billing/portal')
      window.location.href = res.data.url
    } catch (err) {
      alert(extractApiErrorMessage(err) || 'Error opening billing portal')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const currentPlan = status?.plan || 'free'
  const isActive    = status?.subscription_status === 'active'

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Billing & Plans</h1>
        <p className="text-slate-400 mt-1">Manage your subscription and device limits.</p>
      </div>

      {/* Checkout success / cancel banners */}
      {checkoutResult === 'success' && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400">
          Subscription activated! Your plan has been upgraded.
        </div>
      )}
      {checkoutResult === 'canceled' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-400">
          Checkout was canceled. No charges were made.
        </div>
      )}

      {/* Current plan card */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">Current plan</p>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white capitalize">{status?.plan_label || 'Free'}</h2>
              {status?.subscription_status && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  status.subscription_status === 'active'   ? 'bg-green-500/20 text-green-400' :
                  status.subscription_status === 'past_due' ? 'bg-red-500/20 text-red-400' :
                  status.subscription_status === 'trialing' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-600 text-slate-300'
                }`}>
                  {status.subscription_status}
                </span>
              )}
            </div>
          </div>

          {/* Device usage bar */}
          <div className="text-right">
            <p className="text-sm text-slate-400 mb-1">Devices</p>
            <p className="text-white font-medium">
              {status?.device_count} / {status?.device_limit === -1 ? '∞' : status?.device_limit}
            </p>
            <div className="w-32 bg-slate-700 rounded-full h-1.5 mt-1">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  (status?.device_count / status?.device_limit) >= 0.9 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: status?.device_limit === -1 ? '10%' :
                  `${Math.min(100, (status?.device_count / status?.device_limit) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Period end */}
        {status?.current_period_end && (
          <p className="text-slate-400 text-sm mt-4">
            Next billing date: {new Date(status.current_period_end).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        )}

        {/* Manage billing button */}
        {status?.has_billing && (
          <button
            onClick={handleManage}
            className="mt-4 text-sm text-blue-400 hover:text-blue-300 underline"
          >
            Manage payment method / invoices →
          </button>
        )}
      </div>

      {/* Plan cards */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          {currentPlan === 'free' ? 'Upgrade your plan' : 'Available plans'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map(plan => {
            const isCurrent  = currentPlan === plan.id && isActive
            const isUpgrading = upgrading === plan.id

            return (
              <div
                key={plan.id}
                className={`relative bg-slate-800 border rounded-xl p-6 flex flex-col ${
                  plan.popular
                    ? 'border-blue-500 ring-1 ring-blue-500/50'
                    : 'border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-slate-400 text-sm">/month</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">Up to {plan.devices} devices</p>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-green-400 text-xs">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !isCurrent && handleUpgrade(plan.id)}
                  disabled={isCurrent || isUpgrading}
                  className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${
                    isCurrent
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : plan.popular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                  }`}
                >
                  {isUpgrading ? 'Redirecting to Stripe...' :
                   isCurrent   ? 'Current plan' :
                   currentPlan === 'free' ? `Upgrade to ${plan.name}` :
                   'Switch to this plan'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Enterprise CTA */}
        <div className="mt-5 bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Enterprise</h3>
            <p className="text-slate-400 text-sm mt-0.5">
              Unlimited devices, SSO, custom checks, API access, dedicated support.
            </p>
          </div>
          <a
            href="mailto:hello@yourdomain.com?subject=CIS Audit Enterprise"
            className="bg-white text-slate-900 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            Contact us →
          </a>
        </div>
      </div>

      {/* Free plan note */}
      {currentPlan === 'free' && (
        <p className="text-slate-500 text-sm text-center">
          You're on the free plan — 1 device, no team members, no scheduled scans. Upgrade anytime, cancel anytime.
        </p>
      )}
    </div>
  )
}
