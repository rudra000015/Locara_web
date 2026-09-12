'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Camera,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  RefreshCw,
  Database,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

interface BenchmarkTestCase {
  id: string;
  name: string;
  description: string;
  expectedBehavior: string;
  sampleImage: string;
  sampleText?: string;
}

const BENCHMARK_TEST_CASES: BenchmarkTestCase[] = [
  {
    id: 'tc1_exact',
    name: '1. Same Product Image',
    description: 'Exact photograph of Blue Embroidered Kurta',
    expectedBehavior: 'High Cosine Similarity (> 0.95), Top #1 Rank',
    sampleImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    sampleText: 'Blue Embroidered Kurta',
  },
  {
    id: 'tc2_cropped',
    name: '2. Slightly Cropped Image',
    description: 'Cropped view focusing on Zari embroidery detail',
    expectedBehavior: 'Strong Similarity (> 0.85), Robust to framing shifts',
    sampleImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
    sampleText: 'Bridal Lehenga Zari',
  },
  {
    id: 'tc3_lighting',
    name: '3. Different Lighting / Exposure',
    description: 'Warm evening lighting on Banarasi Silk Saree',
    expectedBehavior: 'Visual Match (> 0.80), Color histogram normalization intact',
    sampleImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'tc4_angle',
    name: '4. Different Camera Angle',
    description: 'Side profile shot of Royal Jodhpur Mojari',
    expectedBehavior: 'Pattern & texture recognition matches footwear catalog (> 0.78)',
    sampleImage: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'tc5_jewelry',
    name: '5. Kundan Meenakari Choker Test',
    description: 'Fine jewelry photograph with reflective gemstones',
    expectedBehavior: 'High affinity with Johari Gem Palace inventory',
    sampleImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
    sampleText: 'Kundan choker necklace',
  },
  {
    id: 'tc6_sweets',
    name: '6. Kesar Kaju Katli Mithai Test',
    description: 'Close-up of diamond-shaped silver foil confectionery',
    expectedBehavior: 'Matches Hira Sweets catalog with high confidence (> 0.85)',
    sampleImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'tc7_decor',
    name: '7. Hand-Engraved Brass Urli',
    description: 'Floral brass vessel for diyas and petals',
    expectedBehavior: 'Matches Moradabad Brass Guild items',
    sampleImage: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'tc8_unrelated',
    name: '8. Unrelated Object Test (Negative Control)',
    description: 'Abstract metallic architecture / unrelated background',
    expectedBehavior: 'Properly low similarity score (< 0.45)',
    sampleImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop',
  },
];

export default function DevVisualSearchPage() {
  const [selectedTestCase, setSelectedTestCase] = useState<BenchmarkTestCase>(
    BENCHMARK_TEST_CASES[0]
  );
  const [customImage, setCustomImage] = useState(BENCHMARK_TEST_CASES[0].sampleImage);
  const [customText, setCustomText] = useState(BENCHMARK_TEST_CASES[0].sampleText || '');
  const [userLat, setUserLat] = useState('28.6515');
  const [userLng, setUserLng] = useState('77.1906');

  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [searchOutput, setSearchOutput] = useState<any | null>(null);

  const runBenchmark = async (imgUrl: string, textVal?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imgUrl,
          textQuery: textVal || undefined,
          lat: parseFloat(userLat),
          lng: parseFloat(userLng),
        }),
      });

      const data = await res.json();
      setSearchOutput(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedVectorIndex = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch('/api/dev/seed-vector-index', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSeedResult(
          `Indexed ${data.indexedShops} shops, ${data.indexedProducts} products, and ${data.indexedVectors} visual vectors.`
        );
      } else {
        setSeedResult(`Seeding failed: ${data.error}`);
      }
    } catch (err: any) {
      setSeedResult(`Seeding error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0B08] text-[#F6EAD7] p-4 sm:p-8 font-sans selection:bg-[#C8893F]/30">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/15 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#C8893F]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
                DEVELOPER VECTOR BENCHMARK TESTBENCH
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7]">
              Multimodal Visual Search Inspector
            </h1>
            <p className="text-xs text-[#9E8B75] mt-1 max-w-2xl">
              Inspect L2-normalized 128-dimensional vector embeddings, cosine nearest-neighbor similarity metrics, and hybrid ranking algorithms.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSeedVectorIndex}
              disabled={seeding}
              className="px-4 py-2.5 rounded-2xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/15 text-xs font-bold text-[#E0AF62] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>{seeding ? 'Seeding...' : 'Populate / Re-index Vectors'}</span>
            </button>

            <Link href="/explorer">
              <PremiumButton variant="gold" size="md">
                Launch Explorer
              </PremiumButton>
            </Link>
          </div>
        </div>

        {seedResult && (
          <div className="p-4 rounded-2xl bg-[#1E5544]/20 border border-[#1E5544]/50 text-xs text-[#2D7D64] flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{seedResult}</span>
          </div>
        )}

        {/* 12 Benchmark Preset Selector */}
        <div className="p-6 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 space-y-4 shadow-xl">
          <h3 className="font-serif font-bold text-base text-[#F6EAD7] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#C8893F]" /> Preset Evaluation Scenarios
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BENCHMARK_TEST_CASES.map((tc) => {
              const isSelected = selectedTestCase.id === tc.id;
              return (
                <div
                  key={tc.id}
                  onClick={() => {
                    setSelectedTestCase(tc);
                    setCustomImage(tc.sampleImage);
                    setCustomText(tc.sampleText || '');
                    void runBenchmark(tc.sampleImage, tc.sampleText);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#211A14] border-[#C8893F] shadow-glow-sm'
                      : 'bg-[#17120E] border-[#F6EAD7]/10 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-[#F6EAD7]">{tc.name}</span>
                    <p className="text-[10px] text-[#9E8B75] mt-1 leading-snug">{tc.description}</p>
                  </div>
                  <span className="text-[9px] font-mono text-[#E0AF62] mt-2 block font-semibold">
                    {tc.expectedBehavior}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Query Configurator & Execution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Query Parameters */}
          <div className="p-6 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 space-y-4 shadow-xl">
            <h3 className="font-serif font-bold text-base text-[#F6EAD7]">Query Input Configuration</h3>

            {/* Image Preview */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#9E8B75] mb-1 font-bold">
                Query Image URL
              </label>
              <input
                type="text"
                value={customImage}
                onChange={(e) => setCustomImage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs text-[#F6EAD7] outline-none font-mono"
              />
              {customImage && (
                <div className="mt-2 h-44 rounded-xl overflow-hidden border border-[#F6EAD7]/10 bg-[#0E0B08]">
                  <img src={customImage} alt="Query" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Text Query */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#9E8B75] mb-1 font-bold">
                Multimodal Text Prompt (Optional)
              </label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="e.g. Blue embroidered silk kurta"
                className="w-full px-3 py-2 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs text-[#F6EAD7] outline-none"
              />
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#9E8B75] mb-1 font-bold">
                  User Lat
                </label>
                <input
                  type="text"
                  value={userLat}
                  onChange={(e) => setUserLat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs font-mono text-[#F6EAD7]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#9E8B75] mb-1 font-bold">
                  User Lng
                </label>
                <input
                  type="text"
                  value={userLng}
                  onChange={(e) => setUserLng(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs font-mono text-[#F6EAD7]"
                />
              </div>
            </div>

            <PremiumButton
              variant="gold"
              size="md"
              onClick={() => void runBenchmark(customImage, customText)}
              disabled={loading}
              icon={Play}
              className="w-full"
            >
              {loading ? 'Evaluating Vector Space...' : 'Run Vector Similarity Search'}
            </PremiumButton>
          </div>

          {/* Right: Output Breakdown */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F6EAD7]/10 pb-3">
              <h3 className="font-serif font-bold text-base text-[#F6EAD7]">
                Vector Match Results & Hybrid Scores
              </h3>
              {searchOutput && (
                <span className="text-[10px] font-mono text-[#E0AF62] font-bold">
                  Model: {searchOutput.model} (128-d) • {searchOutput.totalMatched} candidates
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-8 h-8 border-2 border-[#C8893F] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-[#9E8B75]">Calculating Cosine Distance...</p>
              </div>
            ) : searchOutput?.results?.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {searchOutput.results.map((r: any, idx: number) => (
                  <div
                    key={r.productId}
                    className="p-3.5 rounded-2xl bg-[#211A14] border border-[#F6EAD7]/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-[#0E0B08] flex items-center justify-center font-mono text-[10px] font-bold text-[#E0AF62] shrink-0">
                        #{idx + 1}
                      </span>
                      <img
                        src={r.imageUrl}
                        alt={r.productName}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-[#F6EAD7] truncate">{r.productName}</p>
                        <p className="text-[10px] text-[#9E8B75]">
                          {r.shop.name} • {r.shop.distanceText || 'Nearby'}
                        </p>
                        <span className="text-[9px] font-mono text-[#2D7D64]">
                          {r.matchLabel} ({r.visualMatchPercent}%)
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <p className="text-sm font-bold text-[#E0AF62]">
                        Score: {r.finalScore}
                      </p>
                      <p className="text-[9px] text-[#9E8B75]">
                        Sim: {r.visualSimilarity} | Loc: {r.locationScore}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-[#9E8B75]">
                Select a preset scenario above or click &quot;Run Vector Similarity Search&quot; to test.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
