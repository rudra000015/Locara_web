'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  QrCode,
  Navigation,
  Store,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  Sparkles,
  MapPin,
  Copy,
  Check,
  ShieldCheck,
  Phone,
  ArrowRight,
  ExternalLink,
  Key,
} from 'lucide-react';
import { useStore, ReservationPass } from '@/store/useStore';
import { useExplorerRuntimeStore } from '@/store/useExplorerRuntimeStore';
import ExplorerHeader from './ExplorerHeader';
import ExplorerNav from './ExplorerNav';
import Toast from '@/components/ui/Toast';
import { DEFAULT_FILTERS } from '@/data/categories';

export default function ReservationsPage() {
  const router = useRouter();
  const {
    reservations,
    cancelReservation,
    redeemReservationByOtp,
    showToast,
    user,
  } = useStore();
  const { startTrip } = useExplorerRuntimeStore();

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ACTIVE');
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const [selectedPassModal, setSelectedPassModal] = useState<ReservationPass | null>(null);

  // Merchant OTP verification simulator tool
  const [merchantOtpInput, setMerchantOtpInput] = useState('');
  const [merchantResult, setMerchantResult] = useState<{ success: boolean; message: string } | null>(null);

  const filteredPasses = reservations.filter((r) => {
    if (activeTab === 'ACTIVE') return r.status === 'CONFIRMED' || r.status === 'VISITED';
    if (activeTab === 'COMPLETED') return r.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return r.status === 'CANCELLED';
    return true;
  });

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    showToast(`Copied OTP ${otp} to clipboard!`);
    setTimeout(() => setCopiedOtp(null), 2500);
  };

  const handleStartNav = (r: ReservationPass) => {
    const lat = r.shopLocation?.[0] || 12.9716;
    const lng = r.shopLocation?.[1] || 77.6412;
    startTrip({
      shopId: r.shopId,
      shopName: r.shopName,
      destination: { lat, lng },
    });
    showToast(`Opening Google Maps navigation to ${r.shopName}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const handleVerifyOtpAsMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantOtpInput.trim()) return;

    const result = redeemReservationByOtp(merchantOtpInput.trim());
    setMerchantResult(result);
    if (result.success) {
      setMerchantOtpInput('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-4 pb-32">
      {/* Header Banner */}
      <div className="bg-[#ffffff] border border-[rgba(72,55,47,0.12)] rounded-2xl p-6 sm:p-8 mb-8 shadow-[0_12px_32px_-4px_rgba(72,55,47,0.06)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#efeee9] text-[#54512d] text-[11px] font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#6d6943]" />
              OFFLINE PICKUP PASSES & COUNTER OTPS
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1b1c19]">
                My In-Store Reservations
              </h1>
              <p className="text-xs sm:text-sm text-[#49473c] font-serif italic mt-1">
                Your locked offline items. Present your 6-digit OTP or digital QR pass at the store checkout counter to inspect and collect.
              </p>
            </div>

            <button
              onClick={() => router.push('/products')}
              className="btn-primary-irl text-xs py-2.5 px-5 shadow-sm whitespace-nowrap self-start sm:self-auto"
            >
              <span>Browse New Drops →</span>
            </button>
          </div>
        </div>

        {/* Tabs & Merchant Verification Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main List Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-[#cbc6b8]/50 gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'ACTIVE', label: 'Active Passes', count: reservations.filter((r) => r.status === 'CONFIRMED').length },
                { id: 'COMPLETED', label: 'Completed Redemptions', count: reservations.filter((r) => r.status === 'COMPLETED').length },
                { id: 'CANCELLED', label: 'Cancelled', count: reservations.filter((r) => r.status === 'CANCELLED').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-[#54512d] text-[#54512d]'
                      : 'border-transparent text-[#7a776b] hover:text-[#1b1c19]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    activeTab === tab.id
                      ? 'bg-[#54512d] text-[#ffffff]'
                      : 'bg-[#efeee9] text-[#7a776b]'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Passes List */}
            {filteredPasses.length === 0 ? (
              <div className="bg-[#ffffff] border border-[rgba(72,55,47,0.12)] rounded-2xl p-12 text-center shadow-sm">
                <div className="w-14 h-14 rounded-full bg-[#f5f4ef] text-2xl flex items-center justify-center mx-auto mb-3">
                  🎟️
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1b1c19]">
                  No {activeTab.toLowerCase()} passes found
                </h3>
                <p className="text-xs text-[#49473c] mt-1 max-w-sm mx-auto mb-6">
                  {activeTab === 'ACTIVE'
                    ? 'Explore Bangalore physical drops and reserve items for 48 hours with zero advance fee.'
                    : 'Your completed or cancelled passes will show up here for historical tracking.'}
                </p>
                <button
                  onClick={() => router.push('/products')}
                  className="btn-secondary-olive text-xs py-2 px-5"
                >
                  Discover Verified Drops →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPasses.map((pass) => (
                  <div
                    key={pass.id}
                    className="bg-[#ffffff] border border-[rgba(72,55,47,0.12)] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    {/* Top Row: Shop & Status */}
                    <div className="flex items-center justify-between gap-2 border-b border-[#cbc6b8]/40 pb-3">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-[#54512d]" />
                        <span className="font-serif font-bold text-sm text-[#1b1c19]">
                          {pass.shopName}
                        </span>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          pass.status === 'CONFIRMED'
                            ? 'bg-[#f0e9ba] text-[#54512d] border border-[#54512d]/30'
                            : pass.status === 'COMPLETED'
                            ? 'bg-[#e8f5e9] text-[#2e7d32] border border-[#2e7d32]/30'
                            : 'bg-[#ffebee] text-[#ba1a1a] border border-[#ba1a1a]/30'
                        }`}
                      >
                        {pass.status === 'CONFIRMED' ? '● Active Pass (48h Hold)' : pass.status}
                      </span>
                    </div>

                    {/* Middle: Product & OTP Box */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <img
                          src={pass.productImage}
                          alt={pass.productName}
                          className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-[#cbc6b8]"
                        />
                        <div>
                          <h3 className="font-serif text-base font-bold text-[#1b1c19] leading-snug">
                            {pass.productName}
                          </h3>
                          <p className="text-xs text-[#54512d] font-bold mt-0.5">
                            ₹{pass.price.toLocaleString('en-IN')} (Pay at Counter)
                          </p>
                          <p className="text-[11px] text-[#7a776b] mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#54512d]" />
                            {pass.shopAddress}
                          </p>
                          <p className="text-[11px] text-[#6d6943] mt-0.5">
                            📅 Window: {pass.pickupDate}
                          </p>
                        </div>
                      </div>

                      {/* 6-Digit OTP Box */}
                      {pass.status === 'CONFIRMED' && (
                        <div className="w-full sm:w-auto p-3.5 rounded-xl bg-[#faf9f4] border-2 border-dashed border-[#54512d]/40 text-center shrink-0">
                          <span className="text-[10px] font-mono text-[#7a776b] uppercase block">
                            COUNTER OTP
                          </span>
                          <div className="font-mono text-xl font-black text-[#54512d] tracking-[0.18em] my-1">
                            {pass.otp}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyOtp(pass.otp)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#54512d] hover:underline cursor-pointer"
                          >
                            {copiedOtp === pass.otp ? (
                              <>
                                <Check className="w-3 h-3 text-[#2e7d32]" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-[#cbc6b8]/40 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPassModal(pass)}
                          className="px-4 py-1.5 rounded-full bg-[#efeee9] hover:bg-[#e3e3de] text-xs font-bold text-[#1b1c19] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#54512d]" />
                          <span>Show QR Pass</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartNav(pass)}
                          className="px-4 py-1.5 rounded-full bg-[#f5f4ef] hover:bg-[#efeee9] text-xs font-bold text-[#54512d] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Directions</span>
                        </button>
                      </div>

                      {pass.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          onClick={() => cancelReservation(pass.id)}
                          className="text-xs text-[#ba1a1a] hover:underline font-semibold cursor-pointer"
                        >
                          Cancel Hold
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: Store Owner / Counter Verification Simulator */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#ffffff] border border-[rgba(72,55,47,0.12)] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#54512d] text-[#ffffff] flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#1b1c19]">
                    Merchant Counter POS
                  </h3>
                  <span className="text-[10px] font-mono text-[#6d6943] uppercase">
                    Verify Customer OTP
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#49473c] leading-relaxed">
                Shopkeepers scan or enter the customer&apos;s 6-digit OTP code to verify counter pickup and release reserved stock.
              </p>

              <form onSubmit={handleVerifyOtpAsMerchant} className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Enter OTP (e.g. LOC-894210)"
                    value={merchantOtpInput}
                    onChange={(e) => setMerchantOtpInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8] text-xs text-[#1b1c19] font-mono tracking-wider focus:bg-[#ffffff] focus:border-[#54512d] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-[#54512d] hover:bg-[#3f3d22] text-[#ffffff] text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  Verify & Complete Pickup
                </button>
              </form>

              {merchantResult && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    merchantResult.success
                      ? 'bg-[#e8f5e9] border-[#2e7d32]/30 text-[#2e7d32]'
                      : 'bg-[#ffebee] border-[#ba1a1a]/30 text-[#ba1a1a]'
                  }`}
                >
                  {merchantResult.message}
                </div>
              )}
            </div>

            {/* In-Store Etiquette Card */}
            <div className="bg-[#f5f4ef] border border-[#cbc6b8]/50 rounded-2xl p-6 space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1b1c19]">
                The Tactile Offline Promise
              </h4>
              <ul className="text-xs text-[#49473c] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#54512d] font-bold">1.</span>
                  <span><strong>Zero Advance Required:</strong> Physical stock is reserved on good faith for 48 hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#54512d] font-bold">2.</span>
                  <span><strong>Touch & Try:</strong> Inspect texture, weight, and fit directly at the atelier.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#54512d] font-bold">3.</span>
                  <span><strong>Direct Artisan Support:</strong> 100% of your counter payment goes to local masters.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* QR Pass Modal */}
      {selectedPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1b1c19]/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#ffffff] border border-[rgba(72,55,47,0.15)] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative space-y-4 animate-scale-in">
            <button
              type="button"
              onClick={() => setSelectedPassModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f5f4ef] hover:bg-[#efeee9] text-[#1b1c19] flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <span className="inline-block px-3 py-1 rounded-full bg-[#f0e9ba] text-[#54512d] text-[10px] font-mono font-bold uppercase tracking-wider">
              OFFICIAL COUNTER PASS
            </span>

            <h3 className="font-serif text-xl font-bold text-[#1b1c19]">
              {selectedPassModal.productName}
            </h3>
            <p className="text-xs text-[#54512d] font-bold">
              {selectedPassModal.shopName}
            </p>

            {/* Simulated QR Pattern */}
            <div className="w-48 h-48 mx-auto bg-[#faf9f4] border-2 border-[#54512d] rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner my-2">
              <QrCode className="w-32 h-32 text-[#1b1c19]" />
              <span className="font-mono text-xs font-black text-[#54512d] mt-1 tracking-widest">
                {selectedPassModal.otp}
              </span>
            </div>

            <p className="text-xs text-[#49473c]">
              Present this screen to the counter manager upon arrival.
            </p>

            <button
              type="button"
              onClick={() => setSelectedPassModal(null)}
              className="w-full py-2.5 rounded-full bg-[#48372f] hover:bg-[#3d2d26] text-[#faf9f4] text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
