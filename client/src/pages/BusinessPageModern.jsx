import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Copy, MapPin, Phone, Sparkles, Check, Wand2, RefreshCw,
  Award, Clock, ThumbsUp, Quote, ExternalLink, Heart,
  Mail, User, BarChart3, Globe, Building2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';
import { buildBusinessLocationHref } from '../utils/location';

const tones = [
  { key: 'simple', label: 'Simple', description: 'Clean & straightforward', emoji: '✨' },
  { key: 'natural', label: 'Natural', description: 'Conversational tone', emoji: '💬' },
  { key: 'professional', label: 'Professional', description: 'Formal & polished', emoji: '💼' },
  { key: 'detailed', label: 'Detailed', description: 'Thorough feedback', emoji: '📝' },
  { key: 'friendly', label: 'Friendly', description: 'Warm & casual', emoji: '😊' },
  { key: 'casual', label: 'Casual', description: 'Relaxed & informal', emoji: '🎉' }
];

const languages = [
  { key: 'English', label: 'English', flag: '🇺🇸' },
  { key: 'Hindi', label: 'हिंदी', flag: '🇮🇳' },
  { key: 'Hinglish', label: 'Hinglish', flag: '💬' }
];

const shuffleList = (items = []) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-300/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-purple-400/20 to-pink-300/20 blur-3xl" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-300/10 blur-3xl" style={{ animationDelay: '2s' }} />
    </div>
  );
}

export default function BusinessPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tone, setTone] = useState('natural');
  const [language, setLanguage] = useState('Hinglish');
  const [businessSummary, setBusinessSummary] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const { data } = await api.get(`/businesses/${slug}`);
        setBusiness(data);
        setBusinessSummary(data.businessSummary || data.description || '');

        const enabledCategories = (data.reviewCategories || [])
          .filter((item) => item.enabled)
          .map((item) => item.key);
        const randomCount = Math.min(3, Math.max(2, enabledCategories.length > 3 ? 3 : enabledCategories.length));
        const defaults = shuffleList(enabledCategories).slice(0, Math.min(randomCount, enabledCategories.length));
        setSelectedCategories(defaults);
        setTone(data.templateSettings?.defaultTone || 'natural');

        const preferredLanguage = data.supportedLanguages?.length
          ? (data.supportedLanguages.includes('Hinglish') ? 'Hinglish' : data.supportedLanguages[0])
          : 'Hinglish';
        setLanguage(preferredLanguage);

        if (defaults.length) {
          try {
            const { data: preview } = await api.post('/reviews/generate', {
              businessSlug: data.slug,
              selectedCategories: defaults,
              tone: data.templateSettings?.defaultTone || 'natural',
              language: preferredLanguage,
              description: 'The team was warm, the experience felt smooth, and I would happily return.'
            });
            setReviewText(preview.review);
          } catch {
            setReviewText('Your review will appear here after generation.');
          }
        }
      } catch {
        toast.error('Business not found.');
      } finally {
        setLoading(false);
      }
    };
    loadBusiness();
  }, [slug]);

  const totalCategories = useMemo(
    () => (business?.reviewCategories || []).filter((item) => item.enabled),
    [business]
  );

  const businessLocationHref = business ? buildBusinessLocationHref(business.location, business.locationLink) : '#';
  const businessPhoneHref = business?.contactNumber ? `tel:${String(business.contactNumber).replace(/[^\d+]/g, '')}` : '#';

  const toggleCategory = (key) => {
    setSelectedCategories((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 4) {
        toast.error('Select up to 4 categories');
        return prev;
      }
      return [...prev, key];
    });
  };

  const handleGenerateReview = async () => {
    if (!selectedCategories.length) {
      toast.error('Please select at least one category');
      return;
    }
    setIsGenerating(true);
    try {
      const { data } = await api.post('/reviews/generate', {
        businessSlug: slug, selectedCategories, tone, language, businessSummary
      });
      setReviewText(data.review);
      toast.success('✨ Review generated!', {
        style: { borderRadius: '12px', background: '#8b5cf6', color: '#fff' },
      });
    } catch {
      toast.error('Failed to generate review');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyReview = async () => {
    if (!reviewText) return;
    try {
      await navigator.clipboard.writeText(reviewText);
      setCopied(true);
      toast.success('📋 Copied!', {
        style: { borderRadius: '12px', background: '#10b981', color: '#fff' },
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleOpenGoogleReview = async () => {
    const target = business?.googleReviewUrl || `https://www.google.com/search?q=${encodeURIComponent(`${business?.businessName || 'Business'} reviews`)}`;
    if (reviewText.trim()) {
      try { await navigator.clipboard.writeText(reviewText); } catch {}
    }
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <AnimatedBackground />
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-slate-100 border-t-blue-500" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Sparkles className="h-8 w-8 text-blue-500 animate-pulse" />
            </div>
          </div>
          <p className="text-lg font-semibold text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <AnimatedBackground />
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="rounded-full bg-red-100 p-8">
            <Sparkles className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Business Not Found</h2>
          <p className="text-slate-500">The business you're looking for doesn't exist.</p>
          <a href="/" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105">
            Go Back Home <Sparkles size={18} />
          </a>
        </div>
      </div>
    );
  }

  const selectedTone = tones.find(t => t.key === tone) || tones[1];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <AnimatedBackground />
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
                {business.businessName.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Review Page</p>
                <h1 className="text-xl font-bold text-slate-800">{business.businessName}</h1>
              </div>
            </div>
            <a href="/" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:shadow-sm">
              ← Back to Home
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Banner */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 p-8 text-white shadow-2xl shadow-purple-500/30">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjLTIgMC00IDItNCAyczItNCAyLTRzMi0yIDQtMmMyIDAgNCAyIDQgczItNCAyLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-start">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold">{business.welcomeMessage || 'We value your feedback!'}</h2>
                <p className="mt-3 text-blue-100 text-lg">{business.description || 'Help us improve by sharing your experience.'}</p>
              </div>
              <div className="hidden rounded-2xl bg-white/20 p-4 backdrop-blur-sm md:block">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Trust Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: 'Verified', value: 'Yes', icon: Award, color: 'text-amber-300', bg: 'bg-amber-400/20' },
                { label: 'Happy Customers', value: '200+', icon: ThumbsUp, color: 'text-emerald-300', bg: 'bg-emerald-400/20' },
                { label: 'Response Time', value: '<24hrs', icon: Clock, color: 'text-blue-300', bg: 'bg-blue-400/20' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`rounded-xl ${stat.bg} p-4 backdrop-blur-sm`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                      <div>
                        <p className="text-xs text-blue-200">{stat.label}</p>
                        <p className="text-lg font-bold">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Generator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Categories */}
            <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">What stood out?</h3>
                  <p className="text-sm text-slate-500">Select up to 4 categories</p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {selectedCategories.length}/4
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {totalCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category.key);
                  return (
                    <button
                      key={category.key}
                      onClick={() => toggleCategory(category.key)}
                      className={`group relative overflow-hidden rounded-2xl border-2 p-4 transition-all duration-300 ${
                        isSelected
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md shadow-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                          {category.name}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className={`h-full transition-all duration-500 ${isSelected ? 'w-full bg-blue-500' : 'w-0'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone & Language */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3">
                    <Wand2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Review Tone</h3>
                    <p className="text-sm text-slate-500">Choose your style</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {tones.map((toneOption) => (
                    <button
                      key={toneOption.key}
                      onClick={() => setTone(toneOption.key)}
                      className={`w-full rounded-xl border-2 p-3 transition-all ${
                        tone === toneOption.key
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{toneOption.emoji}</span>
                          <span className="font-medium">{toneOption.label}</span>
                        </div>
                        {tone === toneOption.key && <Check className="h-4 w-4 text-purple-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Language</h3>
                    <p className="text-sm text-slate-500">Choose language</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.key}
                      onClick={() => setLanguage(lang.key)}
                      className={`w-full rounded-xl border-2 p-3 transition-all ${
                        language === lang.key
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{lang.flag}</span>
                          <span className="font-medium">{lang.label}</span>
                        </div>
                        {language === lang.key && <Check className="h-4 w-4 text-emerald-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Review Output */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 p-6 shadow-xl shadow-indigo-200/50">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 p-3">
                  <Quote className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Your Review</h3>
                  <p className="text-sm text-slate-500">Generated just for you</p>
                </div>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  value={reviewText || "Select categories and click 'Generate' to get started..."}
                  className="h-56 w-full resize-none rounded-2xl border-2 border-indigo-200 bg-white/80 p-4 text-sm text-slate-700 shadow-inner focus:border-indigo-400 focus:outline-none"
                />
                <Heart className="absolute top-4 right-4 h-5 w-5 text-pink-300" />
              </div>

              <button
                onClick={handleGenerateReview}
                disabled={isGenerating || !selectedCategories.length}
                className="group mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/40 transition-all hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-3">
                    <RefreshCw className="h-5 w-5 animate-spin" /> Generating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Wand2 className="h-5 w-5" /> Generate Review
                  </div>
                )}
              </button>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyReview}
                  disabled={!reviewText || isGenerating}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all ${
                    copied
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'border-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleOpenGoogleReview}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 py-3 font-medium text-blue-700 transition-all hover:bg-blue-100"
                >
                  <ExternalLink className="h-4 w-4" /> Google
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-3">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">Review Impact</h3>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-white/10 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Completion rate</span>
                    <span className="font-bold">92%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/20">
                    <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-green-400 to-emerald-500"></div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Avg. rating boost</span>
                    <span className="font-bold">+0.8 ⭐</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        {(business.location || business.contactNumber || business.contactName) && (
          <section className="mt-12">
            <div className="rounded-3xl bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Visit {business.businessName}</h3>
                  <p className="text-slate-500">Find us & get in touch</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {business.location && (
                  <div className="overflow-hidden rounded-2xl border-2 border-slate-200">
                    <div className="h-48 bg-slate-100">
                      <iframe
                        title="location"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(business.location)}&z=14&output=embed`}
                        className="h-full w-full border-0"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Location</p>
                        <p className="mt-1 font-medium text-slate-800">{business.location}</p>
                      </div>
                      <a href={businessLocationHref} target="_blank" rel="noreferrer" className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 p-3 text-white shadow-lg">
                        <MapPin className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                )}

                {(business.contactNumber || business.contactName) && (
                  <div className="rounded-2xl border-2 border-slate-200 p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contact</p>
                    {business.contactName && (
                      <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Contact Person</p>
                          <p className="font-medium">{business.contactName}</p>
                        </div>
                      </div>
                    )}
                    {business.contactNumber && (
                      <a href={businessPhoneHref} className="mt-3 flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
                        <div className="rounded-lg bg-emerald-100 p-2">
                          <Phone className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-emerald-600">Phone</p>
                          <p className="font-medium">{business.contactNumber}</p>
                        </div>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white/80 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-white">R</div>
              <div>
                <p className="text-sm font-medium text-slate-700">Powered by Review Connect</p>
                <p className="text-xs text-slate-500">Turn happy customers into reviews</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} Review Connect</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
