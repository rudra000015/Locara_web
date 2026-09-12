'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  IndianRupee,
  Plus,
  Sparkles,
  Tag,
  QrCode,
  ArrowRight,
  Store,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';
import VerifyPickupModal from './VerifyPickupModal';

export default function ShowcasePage() {
  const router = useRouter();
  const { user, ownerShopId, ownerShopName, ownerNavTo, shopProducts } = useStore();
  const [metrics, setMetrics] = useState({
    footfall: 42,
    reservations: 8,
    expectedVisits: 12,
    expectedRevenue: 18400,
    followers: 24,
  });
  const [activeReservations, setActiveReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingRes, setVerifyingRes] = useState<any | null>(null);

  const products = shopProducts[ownerShopId] || [];

  const loadDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      const [funnelRes, resRes] = await Promise.all([
        fetch(`/api/analytics/funnel?shopId=${ownerShopId}&range=today`),
        fetch(`/api/reservations?shopId=${ownerShopId}&status=CONFIRMED`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      if (funnelRes.ok) {
        const fData = await funnelRes.json();
        if (fData.metrics) {
          setMetrics({
            footfall: fData.metrics.footfall || 42,
            reservations: fData.metrics.reservations || 8,
            expectedVisits: fData.metrics.expectedVisits || 12,
            expectedRevenue: fData.metrics.expectedRevenue || 18400,
            followers: fData.metrics.followersGained || 24,
          });
        }
      }

      if (resRes.ok) {
        const rData = await resRes.json();
        setActiveReservations(rData.reservations || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [ownerShopId]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Greeting Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Store className="w-4 h-4 text-[#2D7D64]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2D7D64]">
              STOREFRONT OVERVIEW • TODAY
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#F6EAD7]">
            Good Morning, {user?.name || 'Partner'}
          </h1>
          <p className="text-xs text-[#9E8B75] mt-1">
            Managing <strong className="text-[#F6EAD7]">{ownerShopName}</strong> • Real-time footfall and in-store reservations.
          </p>
        </div>

        {/* Quick QR Pickup Trigger */}
        <button
          type="button"
          onClick={() => setVerifyingRes({ direct: true })}
          className="px-5 py-3 rounded-2xl bg-[#C8893F] hover:bg-[#E0AF62] text-xs font-bold text-[#0E0B08] flex items-center gap-2 shadow-glow-sm cursor-pointer shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span>Verify Customer Pickup</span>
        </button>
      </div>

      {/* 5 Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Footfall */}
        <div className="p-5 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-[#9E8B75]">Today&apos;s Footfall</span>
            <Users className="w-4 h-4 text-[#2D7D64]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#F6EAD7]">{metrics.footfall}</p>
          <span className="text-[10px] text-[#2D7D64] mt-1 inline-block font-semibold">Verified Store Visits</span>
        </div>

        {/* Active Reservations */}
        <div className="p-5 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-[#9E8B75]">Reservations</span>
            <CalendarCheck className="w-4 h-4 text-[#C8893F]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#E0AF62]">{metrics.reservations}</p>
          <span className="text-[10px] text-[#9E8B75] mt-1 inline-block">10% Advance Secured</span>
        </div>

        {/* Expected Visits */}
        <div className="p-5 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-[#9E8B75]">Expected Visits</span>
            <Clock className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#F6EAD7]">{metrics.expectedVisits}</p>
          <span className="text-[10px] text-[#9E8B75] mt-1 inline-block">Navigating Currently</span>
        </div>

        {/* Expected Revenue */}
        <div className="p-5 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-[#9E8B75]">Expected Revenue</span>
            <IndianRupee className="w-4 h-4 text-[#E0AF62]" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-[#E0AF62]">
            ₹{metrics.expectedRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-[#2D7D64] mt-1 inline-block">In-Store Balance Due</span>
        </div>

        {/* New Followers */}
        <div className="p-5 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-[#9E8B75]">New Followers</span>
            <Sparkles className="w-4 h-4 text-[#C8893F]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#F6EAD7]">+{metrics.followers}</p>
          <span className="text-[10px] text-[#9E8B75] mt-1 inline-block">Customer Audience</span>
        </div>
      </div>

      {/* Quick Actions Ribbon */}
      <div>
        <h3 className="font-serif font-bold text-lg text-[#F6EAD7] mb-3">Storefront Operations</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => ownerNavTo('addproduct')}
            className="p-4 rounded-2xl bg-[#17120E] hover:bg-[#211A14] border border-[#F6EAD7]/10 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#211A14] flex items-center justify-center text-[#C8893F] group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#F6EAD7]">Add Product</span>
          </button>

          <button
            type="button"
            onClick={() => ownerNavTo('collections')}
            className="p-4 rounded-2xl bg-[#17120E] hover:bg-[#211A14] border border-[#F6EAD7]/10 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#211A14] flex items-center justify-center text-[#E0AF62] group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#F6EAD7]">Create Collection</span>
          </button>

          <button
            type="button"
            onClick={() => ownerNavTo('reservations')}
            className="p-4 rounded-2xl bg-[#17120E] hover:bg-[#211A14] border border-[#F6EAD7]/10 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#211A14] flex items-center justify-center text-[#2D7D64] group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#F6EAD7]">View Reservations</span>
          </button>

          <button
            type="button"
            onClick={() => ownerNavTo('analytics')}
            className="p-4 rounded-2xl bg-[#17120E] hover:bg-[#211A14] border border-[#F6EAD7]/10 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#211A14] flex items-center justify-center text-[#3b82f6] group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#F6EAD7]">Analytics Funnel</span>
          </button>
        </div>
      </div>

      {/* Active Reservations Awaiting Customer Arrival */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#F6EAD7]">
              Active Reservations Awaiting Pickup ({activeReservations.length})
            </h3>
            <p className="text-xs text-[#9E8B75]">
              Customers who have locked inventory with a 10% advance deposit.
            </p>
          </div>

          <button
            type="button"
            onClick={() => ownerNavTo('reservations')}
            className="text-xs font-bold text-[#E0AF62] hover:underline"
          >
            Manage All →
          </button>
        </div>

        {activeReservations.length === 0 ? (
          <div className="p-10 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 text-center">
            <p className="text-xs text-[#9E8B75]">No active pickup reservations pending at this moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeReservations.slice(0, 4).map((r, i) => {
              const item = r.items?.[0] || {};
              return (
                <div
                  key={r.id || r.reservationNumber || i}
                  className="p-4 sm:p-5 rounded-2xl bg-[#17120E] border border-[#F6EAD7]/10 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#E0AF62]">
                        {r.reservationNumber}
                      </span>
                      <span className="text-xs text-[#F6EAD7] font-semibold">{r.userName}</span>
                    </div>
                    <p className="text-xs text-[#9E8B75] truncate mt-0.5">{item.name || 'Artisanal Product'}</p>
                    <p className="text-[11px] font-mono text-[#2D7D64] mt-1">
                      Collect In-Store: ₹{r.remainingAmount} (10% advance paid)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setVerifyingRes(r)}
                    className="px-4 py-2 rounded-xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-xs font-bold text-[#E0AF62] flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Verify
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Verify Pickup Modal */}
      {verifyingRes && (
        <VerifyPickupModal
          isOpen={Boolean(verifyingRes)}
          onClose={() => {
            setVerifyingRes(null);
            void loadDashboardData();
          }}
          reservationId={verifyingRes.reservationNumber || verifyingRes.id}
          onVerified={() => void loadDashboardData()}
        />
      )}
    </div>
  );
}
