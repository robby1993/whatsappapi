'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CreditCard, CheckCircle2, ShieldAlert, Clock, Zap, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Plan {
  id: number;
  planId: string;
  name: string;
  days: number;
  price: number;
}

export default function SubscriptionPage() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchPlansAndStatus();

    // Dynamically load Razorpay Checkout SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const fetchPlansAndStatus = async () => {
    try {
      const [plansRes, dashRes] = await Promise.all([
        api.get('/users/plans'),
        api.get('/users/dashboard'),
      ]);

      if (plansRes.data?.status && Array.isArray(plansRes.data.result)) {
        setPlans(plansRes.data.result);
      }
      if (dashRes.data?.status) {
        setDashboardData(dashRes.data.result);
      }
    } catch (err: any) {
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleBuySubscription = async (planId: number | string) => {
    setBuyingId(planId);
    try {
      // 1. Request Razorpay Order Creation from Backend
      const orderRes = await api.post('/users/create-razorpay-order', { planId });

      if (orderRes.data?.status && orderRes.data?.result?.isRazorpay && (window as any).Razorpay) {
        const orderData = orderRes.data.result;

        // Open Razorpay Payment Modal
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'MsgPilot WhatsApp Automation',
          description: `Subscription: ${orderData.planName}`,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              toast.loading('Verifying Razorpay payment...');
              const verifyRes = await api.post('/users/verify-razorpay-payment', {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                planId,
              });
              toast.dismiss();
              if (verifyRes.data?.status) {
                toast.success('Razorpay payment verified! Subscription activated!');
                fetchPlansAndStatus();
              } else {
                toast.error('Payment verification failed');
              }
            } catch (e: any) {
              toast.dismiss();
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            contact: user?.number || '',
            name: user?.name || 'Customer'
          },
          theme: {
            color: '#059669' // emerald-600
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback to Default API instant buy (if Razorpay credentials not configured)
        const res = await api.post('/users/buy-subscription', { planId });
        if (res.data?.status) {
          toast.success('Subscription activated successfully!');
          fetchPlansAndStatus();
        } else {
          toast.error(res.data?.message || 'Subscription failed');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to purchase subscription');
    } finally {
      setBuyingId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading plans...</div>;

  const isExpired = dashboardData?.isExpired;
  const daysRemaining = dashboardData?.daysRemaining || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Subscription & Plans</h2>
        <p className="text-gray-600 mt-1">Manage your active subscription or upgrade your plan</p>
      </div>

      {/* Expiry Banner */}
      <div
        className={`p-6 rounded-2xl border shadow-sm flex items-center justify-between ${
          isExpired
            ? 'bg-red-50 border-red-200 text-red-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div
            className={`p-3 rounded-xl text-white ${
              isExpired ? 'bg-red-600' : 'bg-emerald-600'
            }`}
          >
            {isExpired ? <ShieldAlert size={28} /> : <CheckCircle2 size={28} />}
          </div>
          <div>
            <h3 className="font-bold text-lg">
              {isExpired ? 'Subscription Expired' : 'Active Subscription'}
            </h3>
            <p className="text-xs opacity-90 mt-0.5">
              {isExpired
                ? 'Your account valid days have ended. Choose a plan below to reactivate your messaging features.'
                : `You currently have ${daysRemaining} day(s) remaining on your active subscription.`}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black font-mono">
            {isExpired ? '0 Days' : `${daysRemaining} Days`}
          </span>
          <p className="text-[10px] uppercase font-bold tracking-wider opacity-75">
            Remaining
          </p>
        </div>
      </div>

      {/* Available Plans Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={20} className="text-emerald-600" />
          Available Subscription Plans
        </h3>

        {plans.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border shadow-sm text-gray-500">
            <CreditCard size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="font-bold text-gray-700">No active plans configured</p>
            <p className="text-xs text-gray-400 mt-1">Admin can add subscription plans in the Admin Panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isBuying = buyingId === p.id || buyingId === p.planId;
              return (
                <div
                  key={p.id || p.planId}
                  className="bg-white p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                        {p.days} Days Access
                      </span>
                      <Zap size={18} className="text-emerald-600" />
                    </div>

                    <h4 className="text-2xl font-bold text-gray-900">{p.name}</h4>

                    <div className="flex items-baseline space-x-1 pt-2 border-t">
                      <span className="text-4xl font-black text-gray-900">₹{p.price}</span>
                      <span className="text-xs text-gray-500 font-medium">/ {p.days} days</span>
                    </div>

                    <ul className="space-y-2 text-xs text-gray-600 pt-4">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>Unlimited Single & Bulk Messaging</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>WhatsApp Multi-Account Gateway</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>Scheduled WhatsApp Message Queue</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBuySubscription(p.id || p.planId)}
                    disabled={isBuying}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                  >
                    {isBuying ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Activating...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        <span>{isExpired ? 'Renew Now' : 'Upgrade Plan'}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
