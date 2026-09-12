'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import NotificationSender from '@/components/owner/NotificationSender';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Users,
  Compass,
  CalendarCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  IndianRupee,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';

interface FunnelStage {
  id: string;
  label: string;
  count: number;
  pct: number;
}

interface AnalyticsData {
  metrics: {
    footfall: number;
    reservations: number;
    expectedVisits: number;
    expectedRevenue: number;
    followersGained: number;
  };
  funnel: FunnelStage[];
}

export default function AnalyticsPage() {
  const { ownerShopId, ownerShopName, shopProducts } = useStore();
  const products = shopProducts[ownerShopId] ?? [];

  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('today');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/analytics/funnel?shopId=${ownerShopId || 'shop_demo'}&range=${timeRange}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load funnel analytics', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ownerShopId, timeRange]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const defaultFunnel: FunnelStage[] = [
    { id: 'discovered', label: 'Discovered on Map / Feed', count: 184, pct: 100 },
    { id: 'shop_viewed', label: 'Storefront Viewed', count: 114, pct: 62 },
    { id: 'product_viewed', label: 'Catalog Explored', count: 85, pct: 46 },
    { id: 'reserved', label: 'Product Reserved (10% Advance)', count: 22, pct: 12 },
    { id: 'nav_started', label: 'Turn-by-Turn Navigation Started', count: 19, pct: 10 },
    { id: 'visited', label: 'Arrived & Checked-In (OTP/QR)', count: 17, pct: 9 },
    { id: 'completed', label: 'Physical Store Purchase Completed', count: 16, pct: 8.7 },
  ];

  const currentFunnel = data?.funnel || defaultFunnel;
  const metrics = data?.metrics || {
    footfall: 17,
    reservations: 22,
    expectedVisits: 26,
    expectedRevenue: 49500,
    followersGained: 24,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Timeframe Filter */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <BarChart3 className="w-4 h-4 text-[#C8893F]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
              REAL-TIME PHYSICAL COMMERCE ANALYTICS
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7]">
            Online-to-Offline Conversion Engine
          </h2>
          <p className="text-xs text-[#9E8B75] mt-1 max-w-xl">
            Track how digital discovery converts into verified physical footfall, 10% advance deposits, and in-store check-ins for {ownerShopName || 'your boutique'}.
          </p>
        </div>

        {/* Range Selector & Refresh */}
        <div className="flex items-center gap-2">
          <div className="bg-[#211A14] p-1 rounded-2xl border border-[#F6EAD7]/10 flex items-center gap-1">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: '30 Days' },
              ] as const
            ).map((range) => (
              <button
                key={range.id}
                type="button"
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeRange === range.id
                    ? 'bg-[#C8893F] text-[#0E0B08] shadow-sm'
                    : 'text-[#9E8B75] hover:text-[#F6EAD7]'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void fetchAnalytics(true)}
            disabled={refreshing}
            className="p-2.5 rounded-2xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-[#9E8B75] hover:text-[#E0AF62] transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#C8893F]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5 Core Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-5 rounded-2xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#9E8B75]">
              Verified Footfall
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#1E5544]/30 border border-[#1E5544]/60 flex items-center justify-center text-[#2D7D64]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7]">{metrics.footfall}</p>
            <span className="text-[10px] text-[#2D7D64] font-medium mt-1 inline-block">QR/OTP Checked-In</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#9E8B75]">
              10% Deposits
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#C8893F]/20 border border-[#C8893F]/40 flex items-center justify-center text-[#E0AF62]">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#E0AF62]">{metrics.reservations}</p>
            <span className="text-[10px] text-[#9E8B75] mt-1 inline-block">Confirmed Holds</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#9E8B75]">
              Expected Visits
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#211A14] border border-[#F6EAD7]/15 flex items-center justify-center text-[#D8C4A7]">
              <Compass className="w-4 h-4 text-[#C8893F]" />
            </div>
          </div>
          <div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7]">{metrics.expectedVisits}</p>
            <span className="text-[10px] text-[#9E8B75] mt-1 inline-block">En Route / Scheduled</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#9E8B75]">
              Est. In-Store Revenue
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#1E5544]/20 border border-[#1E5544]/50 flex items-center justify-center text-[#2D7D64]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-mono text-xl sm:text-2xl font-bold text-[#2D7D64]">
              ₹{metrics.expectedRevenue.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-[#9E8B75] mt-1 inline-block">10% Adv + 90% Balance</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#9E8B75]">
              New Followers
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#C8893F]/20 border border-[#C8893F]/40 flex items-center justify-center text-[#C8893F]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7]">+{metrics.followersGained}</p>
            <span className="text-[10px] text-[#2D7D64] mt-1 inline-block">Loyalty Base Growth</span>
          </div>
        </div>
      </div>

      {/* 7-Stage Full Discovery-to-In-Store Funnel */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F6EAD7]/10 pb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#F6EAD7] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C8893F]" />
              7-Stage Hyperlocal Conversion Funnel
            </h3>
            <p className="text-xs text-[#9E8B75] mt-0.5">
              Visualizing the journey from digital map discovery to verified in-store arrival and cash register settlement.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-[#1E5544]/30 border border-[#1E5544]/60 text-[#2D7D64] font-bold w-fit">
            End-to-End Tracking Active
          </span>
        </div>

        <div className="space-y-4">
          {currentFunnel.map((stage, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === currentFunnel.length - 1;
            const isHighlight = stage.id === 'reserved' || stage.id === 'visited' || stage.id === 'completed';

            return (
              <div
                key={stage.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isHighlight
                    ? 'bg-[#211A14] border-[#C8893F]/30'
                    : 'bg-[#17120E] border-[#F6EAD7]/5'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#0E0B08] border border-[#F6EAD7]/20 flex items-center justify-center font-mono text-[10px] text-[#E0AF62] shrink-0 font-bold">
                      0{idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#F6EAD7] truncate">
                      {stage.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono">
                    <span className="text-xs sm:text-sm font-bold text-[#F6EAD7]">
                      {stage.count.toLocaleString('en-IN')} <span className="text-[10px] text-[#9E8B75] font-normal">events</span>
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                      isFirst ? 'bg-white/10 text-[#F6EAD7]' : isLast ? 'bg-[#1E5544]/40 text-[#2D7D64]' : 'bg-[#C8893F]/15 text-[#E0AF62]'
                    }`}>
                      {stage.pct}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-[#0E0B08] overflow-hidden p-0.5 border border-[#F6EAD7]/10">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      isLast
                        ? 'bg-gradient-to-r from-[#2D7D64] to-[#4ade80]'
                        : isHighlight
                        ? 'bg-gradient-to-r from-[#C8893F] to-[#E0AF62]'
                        : 'bg-gradient-to-r from-[#9E8B75] to-[#D8C4A7]'
                    }`}
                    style={{ width: `${Math.max(stage.pct, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Push Notification & Customer Broadcast Hub */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-xl">
        <NotificationSender />
      </div>
    </div>
  );
}
