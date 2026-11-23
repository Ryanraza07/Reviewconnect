import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Phone,
  Sparkles,
  Star,
  RefreshCw,
  Quote,
  PencilLine,
  ThumbsUp,
  User,
  Navigation
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';
import { buildBusinessLocationHref, buildDirectionsHref } from '../utils/location';

const tones = [
  { key: 'simple', label: 'Short', emoji: '⚡' },
  { key: 'natural', label: 'Natural', emoji: '💬' },
  { key: 'friendly', label: 'Friendly', emoji: '😊' },
  { key: 'professional', label: 'Professional', emoji: '💼' }
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

export default function BusinessPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tone, setTone] = useState('natural');
  const [language, setLanguage] = useState('Hinglish');
  const [customerNote, setCustomerNote] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const { data } = await api.get(`/businesses/${slug}`);
        setBusiness(data);

        const enabledCategories = (data.reviewCategories || [])
          .filter((item) => item.enabled)
          .map((item) => item.key);
        const randomCount = Math.min(2, Math.max(1, enabledCategories.length > 2 ? 2 : enabledCategories.length));
        const defaults = shuffleList(enabledCategories).slice(0, randomCount);
        setSelectedCategories(defaults);
        setTone(data.templateSettings?.defaultTone || 'natural');

        const preferredLanguage = data.supportedLanguages?.length
          ? (data.supportedLanguages.includes('Hinglish') ? 'Hinglish' : data.supportedLanguages[0])
          : 'Hinglish';
        setLanguage(preferredLanguage);

        // Instant pregenerated review from server (zero wait time for customer!)
        if (data.pregeneratedReview?.review) {
          setReviewText(data.pregeneratedReview.review);
          if (data.pregeneratedReview.selectedCategories?.length) {
            setSelectedCategories(data.pregeneratedReview.selectedCategories);
          }
          if (data.pregeneratedReview.tone) {
            setTone(data.pregeneratedReview.tone);
          }
          if (data.pregeneratedReview.language) {
            setLanguage(data.pregeneratedReview.language);
          }
        } else if (defaults.length) {
          // If no advance review in buffer yet, trigger on-demand AI review generation
          api.post('/reviews/generate', {
            businessSlug: slug,
            selectedCategories: defaults,
            tone: data.templateSettings?.defaultTone || 'natural',
            language: preferredLanguage,
            rating: 5,
            description: ''
          }).then((res) => {
            if (res.data?.review) {
              setReviewText(res.data.review);
            }
          }).catch(() => {});
        }
      } catch (error) {
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

  const toggleCategory = (key) => {
    setSelectedCategories((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  };

  const handleGenerate = async () => {
    if (!selectedCategories.length && !customerNote.trim()) {
      toast.error('Please select at least one tag or add a quick note.');
      return;
    }

    setIsGenerating(true);
    try {
      const { data } = await api.post('/reviews/generate', {
        businessSlug: slug,
        selectedCategories,
        tone,
        language,
        rating: 5,
        description: customerNote.trim()
      });
      setReviewText(data.review);
      toast.success('✨ New review generated!');
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not generate review.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyOnly = async () => {
    if (!reviewText.trim()) return;
    try {
      await navigator.clipboard.writeText(reviewText.trim());
      setCopied(true);
      toast.success('📋 Copied to clipboard!');
      setTimeout(() => setCopied(false), 2200);

      await api.post('/reviews/track', {
        eventType: 'review-copy',
        businessSlug: slug,
        metadata: { tone, language }
      }).catch(() => {});
    } catch {
      toast.error('Copy failed. Please copy manually.');
    }
  };

  const handleGoogleRedirect = async () => {
    const target = business?.googleReviewUrl || `https://www.google.com/search?q=${encodeURIComponent(`${business?.businessName || 'Business'} reviews`)}`;

    if (reviewText.trim()) {
      try {
        await navigator.clipboard.writeText(reviewText.trim());
        setCopied(true);
        toast.success('Copied! Opening Google Reviews...', { duration: 3000 });
        setTimeout(() => setCopied(false), 2200);
      } catch {
        // Fallback without blocking
      }
    }

    await api.post('/reviews/track', {
      eventType: 'google-review-click',
      businessSlug: slug,
      metadata: { rating: 5, tone, language }
    }).catch(() => {});

    window.open(target, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900 px-6 py-3.5 text-sm font-medium text-slate-200 shadow-xl">
          <RefreshCw size={18} className="animate-spin text-cyan-400" />
          Loading business page...
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-white">
        <div className="max-w-md rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <h2 className="text-xl font-bold text-red-300">Business Not Found</h2>
          <p className="mt-2 text-sm text-slate-400">The business link you visited does not exist or may have been updated.</p>
        </div>
      </div>
    );
  }

  const primaryColor = business.branding?.primaryColor || '#2563eb';

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#f0f7ff_0%,_#f8fafc_60%,_#f1f5f9_100%)] text-slate-900 antialiased">
      <Toaster position="top-center" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-8 sm:py-3.5">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {business.logo ? (
              <img
                src={business.logo}
                alt={business.businessName}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover ring-2 ring-slate-100 shrink-0"
              />
            ) : (
              <div
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl font-bold text-white shadow-xs shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {business.businessName.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-sm sm:text-base font-bold text-slate-900">{business.businessName}</h2>
              <p className="truncate text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-slate-500">
                {business.category}
              </p>
            </div>
          </div>

          {/* 5-Star Badge in header */}
          <div className="flex items-center gap-1 shrink-0 rounded-full bg-amber-50 border border-amber-200/70 px-3 py-1">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={13} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[11px] font-bold text-amber-800 ml-0.5">5.0</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:px-8 sm:py-8 space-y-5 sm:space-y-6">
        
        {/* ========================================================
            BIGGER & WIDER BUSINESS INFORMATION CARD
           ======================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 md:p-8 shadow-sm">
          {/* Subtle brand glow backdrop */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-15"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-5 sm:gap-6">
            {/* Left: Logo + Business Info */}
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 min-w-0">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.businessName}
                  className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-2xl object-cover ring-4 ring-slate-100 shadow-sm shrink-0"
                />
              ) : (
                <div
                  className="flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl font-black text-2xl sm:text-3xl md:text-4xl text-white shadow-md shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {business.businessName.charAt(0)}
                </div>
              )}

              <div className="min-w-0 space-y-1.5 sm:space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <ThumbsUp size={12} className="text-emerald-600" /> Verified Business
                  </span>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    {business.category}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {business.businessName}
                </h1>

                <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                  {business.welcomeMessage || 'We value your feedback and would love to hear about your experience!'}
                </p>
              </div>
            </div>

            {/* Right: Large 5-Star Rating Showcase Box */}
            <div className="flex sm:shrink-0 items-center justify-between sm:justify-center md:flex-col rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-amber-50/90 border border-amber-200/80 p-4 sm:px-6 sm:py-5 text-center shadow-xs">
              <div className="text-left sm:text-center">
                <div className="flex items-center justify-start sm:justify-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={20} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="mt-1 text-base sm:text-xl font-black text-slate-900">
                  5.0 <span className="text-xs font-semibold text-slate-600">/ 5.0 Rating</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 rounded-full px-2.5 py-0.5 sm:mt-1.5">
                Google Review Ready
              </span>
            </div>
          </div>

          {/* Quick Business Details & Contact Badges */}
          {(business.location || business.contactNumber || business.contactName) && (
            <div className="mt-5 pt-4 sm:mt-6 sm:pt-5 border-t border-slate-100 flex flex-wrap gap-2.5 sm:gap-3 text-xs sm:text-sm font-semibold text-slate-700">
              {business.location && (
                <a
                  href={buildBusinessLocationHref(business.location, business.locationLink)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 transition hover:bg-slate-100 hover:text-blue-600"
                >
                  <MapPin size={15} className="text-red-500 shrink-0" />
                  <span className="truncate max-w-[240px] sm:max-w-none">{business.location}</span>
                  <ExternalLink size={12} className="text-slate-400" />
                </a>
              )}
              {business.contactNumber && (
                <a
                  href={`tel:${String(business.contactNumber).replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 transition hover:bg-slate-100 hover:text-emerald-600"
                >
                  <Phone size={15} className="text-emerald-600 shrink-0" />
                  <span>{business.contactNumber}</span>
                </a>
              )}
              {business.contactName && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 text-slate-600">
                  <User size={15} className="text-blue-500 shrink-0" />
                  <span>{business.contactName}</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Builder & Review Grid:
            On mobile (< lg): Review Card is ORDER-1 (displayed right below the business card, visible without scrolling!)
            On desktop (>= lg): Review Card is ORDER-2 (on right side), Customizer is ORDER-1 (on left side)
        */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          
          {/* ========================================================
              REVIEW OUTPUT CARD:
              Order 1 on mobile: Instantly visible above the fold!
              Order 2 on desktop: Positioned on the right column!
             ======================================================== */}
          <section className="order-1 lg:order-2 rounded-3xl border border-blue-200/90 bg-gradient-to-b from-blue-50/50 via-white to-white p-4 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <Quote size={14} />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Your Google Review</h3>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <PencilLine size={12} /> Tap to edit
                </span>
              </div>

              {/* Editable Review Textarea - Compact and readable */}
              <div className="relative mt-2.5">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                  placeholder="Generating your review..."
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-sm leading-relaxed text-slate-800 shadow-inner outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
                <div className="mt-1 flex items-center justify-between px-1 text-[11px] text-slate-400">
                  <span className="text-emerald-600 font-medium">✓ Ready for Google Maps</span>
                  <span>{reviewText.trim().length} chars</span>
                </div>
              </div>
            </div>

            {/* Primary Action Button: Copy & Post on Google Reviews */}
            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleRedirect}
                disabled={!reviewText.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 px-4 text-sm sm:text-base font-bold text-white shadow-md shadow-emerald-600/20 transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ExternalLink size={17} />
                Copy & Post on Google Reviews
              </button>

              {/* Quick Secondary Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyOnly}
                  disabled={!reviewText.trim()}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isGenerating ? 'animate-spin text-blue-600' : ''} />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          </section>

          {/* ========================================================
              CUSTOMIZER CONTROLS:
              Order 2 on mobile: Directly below the review card!
              Order 1 on desktop: Left-hand control panel!
             ======================================================== */}
          <section className="order-2 lg:order-1 rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-sm">
            {/* Tag Selection */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-900">What stood out most?</label>
                <span className="text-[11px] font-semibold text-slate-500">
                  {selectedCategories.length} selected
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">Tap tags to personalize your review</p>

              <div className="mt-2.5 flex flex-wrap gap-1.5 sm:gap-2">
                {totalCategories.map((item) => {
                  const isSelected = selectedCategories.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleCategory(item.key)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs ring-1 ring-slate-900'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected && <Check size={12} className="text-emerald-400" />}
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Personal Detail */}
            <div className="mt-4">
              <label className="text-xs sm:text-sm font-bold text-slate-900">
                Add a specific detail <span className="text-[11px] font-normal text-slate-500">(Optional)</span>
              </label>
              <input
                type="text"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                maxLength={180}
                placeholder="e.g. Loved the iced latte and friendly service!"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            {/* Tone & Language side-by-side or stacked */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tone */}
              <div>
                <label className="text-xs font-bold text-slate-900">Tone</label>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {tones.map((t) => {
                    const isSelected = tone === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTone(t.key)}
                        className={`flex items-center justify-center gap-1 rounded-lg border py-1.5 px-2 text-[11px] font-medium transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-xs ring-1 ring-blue-500'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{t.emoji}</span>
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="text-xs font-bold text-slate-900">Language</label>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                  {languages.map((l) => {
                    const isSelected = language === l.key;
                    return (
                      <button
                        key={l.key}
                        type="button"
                        onClick={() => setLanguage(l.key)}
                        className={`flex items-center justify-center gap-1 rounded-lg border py-1.5 px-1.5 text-[11px] font-medium transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold shadow-xs ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Update / Generate Button */}
            <div className="mt-5 pt-3.5 border-t border-slate-100">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 px-4 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-cyan-400" />
                    Generating concise review...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-300" />
                    Update Review with Options
                  </>
                )}
              </button>
            </div>
          </section>

        </div>

        {/* Location & Navigation Card - Fast, zero-blocking, mobile-optimized */}
        {business.location && (
          <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                  <MapPin size={12} className="text-blue-600" />
                  Google Maps Location
                </div>
                <h3 className="mt-1 text-base sm:text-lg font-bold text-slate-900">{business.businessName}</h3>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
                  <span className="font-medium text-slate-800">{business.location}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={buildDirectionsHref(business.location, business.locationLink)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  <Navigation size={14} /> Get Directions
                </a>
                <a
                  href={buildBusinessLocationHref(business.location, business.locationLink)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                >
                  <ExternalLink size={14} /> Open in Maps
                </a>
                {business.contactNumber && (
                  <a
                    href={`tel:${String(business.contactNumber).replace(/[^\d+]/g, '')}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                  >
                    <Phone size={14} className="text-emerald-600" /> Call
                  </a>
                )}
              </div>
            </div>

            {/* Stylized Interactive Map Preview banner */}
            <a
              href={buildBusinessLocationHref(business.location, business.locationLink)}
              target="_blank"
              rel="noreferrer"
              className="group relative mt-4 block overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200/70 p-6 sm:p-8 transition hover:border-blue-300 hover:shadow-md"
            >
              {/* Subtle background street grid lines */}
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #94a3b8 1px, transparent 1px), linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
                  backgroundSize: '24px 24px, 48px 48px, 48px 48px'
                }}
              />

              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                {/* Pulsing Pin Marker */}
                <div className="relative mb-3 flex items-center justify-center">
                  <span className="absolute h-12 w-12 animate-ping rounded-full bg-red-400 opacity-30" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/30">
                    <MapPin size={24} className="drop-shadow" />
                  </div>
                </div>

                <div className="max-w-md rounded-xl border border-white/80 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur-sm">
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{business.businessName}</p>
                  <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-1">{business.location}</p>
                </div>

                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:underline">
                  <span>Tap to view live location & navigation on Google Maps</span>
                  <ExternalLink size={13} />
                </div>
              </div>
            </a>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <p>Powered by <span className="font-semibold text-slate-700">Review Connect</span> • Verified Google Reviews</p>
      </footer>
    </div>
  );
}
