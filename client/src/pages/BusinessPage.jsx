import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  MessageCircle,
  Twitter,
  Youtube,
  Linkedin,
  Sparkles,
  Star,
  RefreshCw,
  PencilLine,
  Navigation,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';
import { buildBusinessLocationHref, buildDirectionsHref } from '../utils/location';

const resolveSocialHref = (platform, value) => {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${trimmed.replace(/^@/, '')}`;
    case 'facebook':
      return `https://facebook.com/${trimmed.replace(/^@/, '')}`;
    case 'twitter':
      return `https://x.com/${trimmed.replace(/^@/, '')}`;
    case 'youtube':
      return trimmed.startsWith('@') ? `https://youtube.com/${trimmed}` : `https://youtube.com/@${trimmed}`;
    case 'whatsapp':
      return `https://wa.me/${trimmed.replace(/[^\d]/g, '')}`;
    case 'linkedin':
      return trimmed.includes('/') ? `https://linkedin.com/${trimmed}` : `https://linkedin.com/company/${trimmed}`;
    case 'website':
      return `https://${trimmed}`;
    default:
      return trimmed;
  }
};

const resolveSocialDisplay = (platform, value) => {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (platform === 'whatsapp') {
    return trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
  }
  if (platform === 'instagram' || platform === 'twitter') {
    const handle = trimmed.replace(/^https?:\/\/(www\.)?(instagram\.com|x\.com|twitter\.com)\//, '').replace(/\/$/, '');
    return handle.startsWith('@') ? handle : `@${handle}`;
  }
  return trimmed.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
};

const languages = [
  { key: 'English', label: 'English', flag: '🇺🇸' },
  { key: 'Hindi', label: 'हिंदी', flag: '🇮🇳' },
  { key: 'Hinglish', label: 'Hinglish', flag: '💬' }
];

const ratingLabels = {
  5: '5.0 — Excellent',
  4: '4.0 — Good',
  3: '3.0 — Average',
  2: '2.0 — Below Average',
  1: '1.0 — Disappointing'
};

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
  const [rating, setRating] = useState(5);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [language, setLanguage] = useState('Hinglish');
  const [userSelectedLanguage, setUserSelectedLanguage] = useState(false);
  const [customerNote, setCustomerNote] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [reviewHighlighted, setReviewHighlighted] = useState(false);
  const reviewCardRef = useRef(null);

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

        const supportedLangs = data.supportedLanguages?.length
          ? data.supportedLanguages
          : ['English', 'Hinglish'];
        // Pick randomized initial language specifically between English and Hinglish
        const initialCandidates = ['English', 'Hinglish'].filter((l) => supportedLangs.includes(l));
        const randomizedInitialLang = initialCandidates.length
          ? initialCandidates[Math.floor(Math.random() * initialCandidates.length)]
          : 'English';

        setLanguage(randomizedInitialLang);

        // Instant pregenerated review from server (zero wait time for customer!)
        if (data.pregeneratedReview?.review) {
          setReviewText(data.pregeneratedReview.review);
          if (data.pregeneratedReview.selectedCategories?.length) {
            setSelectedCategories(data.pregeneratedReview.selectedCategories);
          }
          if (data.pregeneratedReview.language) {
            setLanguage(data.pregeneratedReview.language);
          }
          if (data.pregeneratedReview.rating) {
            setRating(data.pregeneratedReview.rating);
          }
        } else if (defaults.length) {
          // If no advance review in buffer yet, trigger on-demand AI review generation with random tone and randomized language
          setIsGenerating(true);
          api.post('/reviews/generate', {
            businessSlug: slug,
            selectedCategories: defaults,
            tone: 'random',
            language: randomizedInitialLang,
            rating: 5,
            description: ''
          }).then((res) => {
            if (res.data?.review) {
              setReviewText(res.data.review);
            }
          }).catch(() => {}).finally(() => {
            setIsGenerating(false);
          });
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

  const handleGenerate = async (overrideLanguage = null) => {
    setIsGenerating(true);
    const activeLanguage = overrideLanguage || language;
    try {
      const categoriesToSend = selectedCategories.length
        ? selectedCategories
        : (customerNote.trim() ? [] : ['overall']);

      const { data } = await api.post('/reviews/generate', {
        businessSlug: slug,
        selectedCategories: categoriesToSend,
        tone: 'random',
        language: activeLanguage,
        rating,
        description: customerNote.trim()
      });
      setReviewText(data.review);
      toast.success('✨ New review ready!');

      // Highlight the updated review card
      setReviewHighlighted(true);
      setTimeout(() => setReviewHighlighted(false), 2000);

      // Smoothly scroll back to the updated review preview so customer can immediately copy it
      if (reviewCardRef.current) {
        reviewCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not generate review.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTryAnother = () => {
    let nextLang = language;
    if (!userSelectedLanguage) {
      // Alternate / randomize between English and Hinglish (not Hindi)
      nextLang = language === 'English' ? 'Hinglish' : 'English';
      setLanguage(nextLang);
    }
    handleGenerate(nextLang);
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
        metadata: { rating, language }
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
      metadata: { rating, language }
    }).catch(() => {});

    window.open(target, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-slate-800">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-xs">
          <RefreshCw size={16} className="animate-spin text-blue-600" />
          Loading review page...
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 text-slate-800">
        <div className="max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 text-center shadow-xs">
          <h2 className="text-lg font-bold text-slate-900">Business Not Found</h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500">The business link does not exist or may have been updated.</p>
        </div>
      </div>
    );
  }

  const primaryColor = business.branding?.primaryColor || '#2563eb';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] antialiased">
      <Toaster position="top-center" />

      {/* Modern Compact Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            {business.logo ? (
              <img
                src={business.logo}
                alt={business.businessName}
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200/80 shrink-0"
              />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white text-xs shadow-2xs shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {business.businessName.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <h1 className="truncate text-sm font-semibold text-slate-900 tracking-tight">
                  {business.businessName}
                </h1>
                {Boolean(business.isVerified) && (
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" title="Verified business" />
                )}
              </div>
              <p className="truncate text-[11px] text-slate-500 capitalize">
                {business.category} {business.location ? `• ${business.location}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {business.contactNumber && (
              <a
                href={`tel:${String(business.contactNumber).replace(/[^\d+]/g, '')}`}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                title="Call business"
              >
                <Phone size={11} className="text-slate-500" />
                <span className="hidden sm:inline">Call</span>
              </a>
            )}
            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                title="Email business"
              >
                <Mail size={11} className="text-slate-500" />
                <span className="hidden sm:inline">Email</span>
              </a>
            )}
            {business.socialLinks?.whatsapp && (
              <a
                href={resolveSocialHref('whatsapp', business.socialLinks.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition"
                title="WhatsApp business"
              >
                <MessageCircle size={11} className="text-emerald-600" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
            {business.googleReviewUrl && (
              <a
                href={business.googleReviewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                <ExternalLink size={11} className="text-slate-500" />
                <span className="hidden sm:inline">Google</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-5">

        {/* =========================================================================
            2. Generated review preview
            3. Copy & Post to Google Reviews button
            4. Copy Text and Try Another actions
            CRITICAL: Keeps preview & primary CTA at the TOP without scrolling!
           ========================================================================= */}
        <section
          ref={reviewCardRef}
          className={`scroll-mt-16 sm:scroll-mt-20 relative rounded-2xl border bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 ${
            reviewHighlighted
              ? 'border-blue-400 ring-2 ring-blue-500/20'
              : 'border-slate-200/80'
          }`}
        >
          {/* Header row: Star Rating Choice & Character Count */}
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1 hidden xs:inline">
                Rating
              </span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isFilled = starValue <= rating;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(starValue)}
                      className="p-0.5 rounded hover:bg-slate-100 transition active:scale-95"
                      aria-label={`Select ${starValue} stars`}
                    >
                      <Star
                        size={18}
                        className={isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-200 hover:text-amber-300'}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-slate-700 ml-1">
                {ratingLabels[rating]}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="hidden sm:inline-flex items-center gap-1">
                <PencilLine size={11} /> Tap text to edit
              </span>
              <span>{reviewText.trim().length} chars</span>
            </div>
          </div>

          {/* 2. Distraction-Free Review Text Editor / Loading Shimmer */}
          <div className="relative">
            {isGenerating && !reviewText ? (
              <div className="flex items-center gap-2.5 py-6 text-xs sm:text-sm text-slate-500">
                <RefreshCw size={15} className="animate-spin text-blue-600" />
                <span>Crafting your ready-to-use review...</span>
              </div>
            ) : (
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                placeholder="Your generated review will appear here..."
                className="w-full resize-none rounded-xl border-0 bg-transparent p-0 text-sm sm:text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
            )}
          </div>

          {/* 3. Copy & Post to Google Reviews button & 4. Copy Text / Try Another actions */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
            {/* 3. Primary CTA: Copy & Post on Google Reviews */}
            <button
              type="button"
              onClick={handleGoogleRedirect}
              disabled={!reviewText.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3.5 px-4 text-xs sm:text-sm font-semibold text-white shadow-xs transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ExternalLink size={16} />
              <span>Copy & Post on Google Reviews</span>
            </button>

            {/* 4. Quick Secondary Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyOnly}
                disabled={!reviewText.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 py-2.5 px-3 text-xs font-medium text-slate-700 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-600 stroke-[2.5]" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} className="text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTryAnother}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 py-2.5 px-3 text-xs font-medium text-slate-700 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                title="Generate another version"
              >
                <RefreshCw size={13} className={`text-slate-500 ${isGenerating ? 'animate-spin text-blue-600' : ''}`} />
                <span>Try Another</span>
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            INTERACTIVE CUSTOMIZATION (Linear / Stripe style)
            Allows fine-tuning of tags, specific details & language (tone is selected randomly by AI).
           ========================================================================= */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                Customize Experience Tags & Style
              </h2>
              <p className="text-xs text-slate-500">
                Select highlights to personalize the AI-crafted review
              </p>
            </div>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {selectedCategories.length} selected
            </span>
          </div>

          {/* Topic Chips (Linear / Stripe tag style) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Experience Highlights
            </label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {totalCategories.map((item) => {
                const isSelected = selectedCategories.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleCategory(item.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition active:scale-[0.98] ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-500/30'
                        : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/60 hover:text-slate-800'
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-blue-600 stroke-[2.5]" />}
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Detail Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Specific Detail <span className="normal-case font-normal text-slate-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              maxLength={180}
              placeholder="e.g. Loved the iced latte and friendly service"
              className="w-full rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>

          {/* Language Selection */}
          <div className="space-y-1 pt-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Language
            </label>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
              {languages.map((l) => {
                const isSelected = language === l.key;
                return (
                  <button
                    key={l.key}
                    type="button"
                    onClick={() => {
                      setLanguage(l.key);
                      setUserSelectedLanguage(true);
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-medium transition ${
                      isSelected
                        ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-sm">{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 9. Generate My Review button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-3.5 px-4 text-xs sm:text-sm font-semibold text-white shadow-xs transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={15} className="animate-spin text-slate-300" />
                  <span>Crafting Review...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} className="text-amber-300" />
                  <span>Generate My Review</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* =========================================================================
            10. Business location & Social Handles / Contact
           ========================================================================= */}
        {(business.location || business.contactNumber || business.email || (business.socialLinks && Object.values(business.socialLinks).some(Boolean))) && (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-4">
            {/* Location row */}
            {business.location && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {business.businessName}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                        {business.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={buildDirectionsHref(business.location, business.locationLink)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition active:scale-[0.98]"
                    >
                      <Navigation size={12} />
                      <span>Directions</span>
                    </a>
                    <a
                      href={buildBusinessLocationHref(business.location, business.locationLink)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-medium transition"
                    >
                      <ExternalLink size={12} className="text-slate-500" />
                      <span>Maps</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsMapExpanded(!isMapExpanded)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-600 px-2 py-1.5 text-xs font-medium transition"
                      aria-expanded={isMapExpanded}
                      title="Toggle map view"
                    >
                      {isMapExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>

                {/* Collapsible map banner */}
                {isMapExpanded && (
                  <a
                    href={buildBusinessLocationHref(business.location, business.locationLink)}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative mt-3 block overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 p-5 text-center transition hover:border-slate-300"
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-20"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle, #94a3b8 1px, transparent 1px), linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
                        backgroundSize: '24px 24px, 48px 48px, 48px 48px'
                      }}
                    />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-xs mb-1.5">
                        <MapPin size={16} />
                      </div>
                      <p className="text-xs font-semibold text-slate-900">{business.businessName}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-sm">{business.location}</p>
                      <span className="mt-1.5 text-[11px] font-medium text-blue-600 group-hover:underline inline-flex items-center gap-1">
                        Open in Google Maps <ExternalLink size={10} />
                      </span>
                    </div>
                  </a>
                )}
              </div>
            )}

            {/* Social Handles, Phone & Email section */}
            {(business.contactNumber || business.email || (business.socialLinks && Object.values(business.socialLinks).some(Boolean))) && (
              <div className={business.location ? 'pt-3.5 border-t border-slate-100' : ''}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Connect & Follow Us
                  </h4>
                  <span className="text-[11px] text-slate-400">Official Handles</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {business.contactNumber && (
                    <a
                      href={`tel:${String(business.contactNumber).replace(/[^\d+]/g, '')}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 px-3 py-1.5 text-xs font-medium text-slate-700 transition"
                      title="Call business"
                    >
                      <Phone size={13} className="text-blue-600" />
                      <span>{business.contactNumber}</span>
                    </a>
                  )}

                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 px-3 py-1.5 text-xs font-medium text-slate-700 transition"
                      title="Email business"
                    >
                      <Mail size={13} className="text-blue-600" />
                      <span>{business.email}</span>
                    </a>
                  )}

                  {business.socialLinks?.whatsapp && (
                    <a
                      href={resolveSocialHref('whatsapp', business.socialLinks.whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/50 hover:bg-emerald-100/70 hover:border-emerald-300 text-emerald-800 px-3 py-1.5 text-xs font-medium transition"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle size={13} className="text-emerald-600" />
                      <span>WhatsApp {resolveSocialDisplay('whatsapp', business.socialLinks.whatsapp)}</span>
                    </a>
                  )}

                  {business.socialLinks?.instagram && (
                    <a
                      href={resolveSocialHref('instagram', business.socialLinks.instagram)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-pink-200/80 bg-pink-50/50 hover:bg-pink-100/70 hover:border-pink-300 text-pink-800 px-3 py-1.5 text-xs font-medium transition"
                      title="Instagram Profile"
                    >
                      <Instagram size={13} className="text-pink-600" />
                      <span>{resolveSocialDisplay('instagram', business.socialLinks.instagram)}</span>
                    </a>
                  )}

                  {business.socialLinks?.website && (
                    <a
                      href={resolveSocialHref('website', business.socialLinks.website)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 px-3 py-1.5 text-xs font-medium text-slate-700 transition"
                      title="Official Website"
                    >
                      <Globe size={13} className="text-blue-600" />
                      <span>{resolveSocialDisplay('website', business.socialLinks.website)}</span>
                    </a>
                  )}

                  {business.socialLinks?.facebook && (
                    <a
                      href={resolveSocialHref('facebook', business.socialLinks.facebook)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 px-3 py-1.5 text-xs font-medium text-slate-700 transition"
                      title="Facebook Page"
                    >
                      <Facebook size={13} className="text-blue-700" />
                      <span>Facebook</span>
                    </a>
                  )}

                  {business.socialLinks?.twitter && (
                    <a
                      href={resolveSocialHref('twitter', business.socialLinks.twitter)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 transition"
                      title="X / Twitter Handle"
                    >
                      <Twitter size={13} className="text-slate-800" />
                      <span>{resolveSocialDisplay('twitter', business.socialLinks.twitter)}</span>
                    </a>
                  )}

                  {business.socialLinks?.youtube && (
                    <a
                      href={resolveSocialHref('youtube', business.socialLinks.youtube)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200/80 bg-red-50/50 hover:bg-red-100/70 hover:border-red-300 text-red-800 px-3 py-1.5 text-xs font-medium transition"
                      title="YouTube Channel"
                    >
                      <Youtube size={13} className="text-red-600" />
                      <span>YouTube</span>
                    </a>
                  )}

                  {business.socialLinks?.linkedin && (
                    <a
                      href={resolveSocialHref('linkedin', business.socialLinks.linkedin)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200/80 bg-blue-50/50 hover:bg-blue-100/70 hover:border-blue-300 text-blue-800 px-3 py-1.5 text-xs font-medium transition"
                      title="LinkedIn Page"
                    >
                      <Linkedin size={13} className="text-blue-700" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Clean Linear-style Footer */}
      <footer className="mt-8 border-t border-slate-200/60 bg-white py-5 text-center text-[11px] text-slate-400">
        <p>Powered by <span className="font-medium text-slate-600">Review Connect</span> • Google Reviews Assistant</p>
      </footer>
    </div>
  );
}
