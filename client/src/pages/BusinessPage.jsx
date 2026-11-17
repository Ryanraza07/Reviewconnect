import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Link2, MapPin, PencilLine, Phone, Sparkles } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';
import { buildBusinessLocationHref } from '../utils/location';

const tones = ['simple', 'natural', 'professional', 'detailed', 'friendly', 'casual'];
const languages = ['English', 'Hindi', 'Hinglish'];

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
  const [businessSummary, setBusinessSummary] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
              rating: 5,
              description: 'The team was warm, the experience felt smooth, and I would happily return.'
            });
            setReviewText(preview.review);
          } catch {
            setReviewText('Your review will appear here after generation.');
          }
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
    if (!selectedCategories.length) {
      toast.error('Select at least one review tag before generating.');
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
        businessSummary
      });
      setReviewText(data.review);
      toast.success('Review generated successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not generate the review.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!reviewText) return;
    try {
      await navigator.clipboard.writeText(reviewText);
      await api.post('/reviews/track', {
        eventType: 'review-copy',
        businessSlug: slug,
        metadata: { tone, language }
      });
      toast.success('Review copied to clipboard.');
    } catch {
      toast.error('Copy failed. Please copy manually.');
    }
  };

  const handleGoogleRedirect = async () => {
    const target = business?.googleReviewUrl || `https://www.google.com/search?q=${encodeURIComponent(`${business?.businessName || 'Business'} reviews`)}`;

    if (reviewText.trim()) {
      try {
        await navigator.clipboard.writeText(reviewText);
      } catch {
        // fallback without blocking redirect
      }
    }

    await api.post('/reviews/track', {
      eventType: 'google-review-click',
      businessSlug: slug,
      metadata: { rating: 5, tone, language }
    });

    window.open(target, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-full border border-white/10 bg-slate-900 px-5 py-3 text-sm text-slate-200">Loading business page...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-200">Business not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef4ff_38%,_#f8fafc_100%)] text-slate-900">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <header
          className="overflow-hidden rounded-[30px] border border-slate-200 bg-white/85 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur md:p-6"
          style={{ boxShadow: `0 30px 80px ${business.branding?.primaryColor || '#2563eb'}18` }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={business.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=120&q=80'}
                alt={business.businessName}
                className="h-16 w-16 rounded-2xl object-cover ring-4 ring-slate-100"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Review Connect</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">{business.businessName}</h1>
              </div>
            </div>
            <div className="rounded-full px-4 py-2 text-sm font-medium" style={{ background: `${business.branding?.primaryColor || '#2563eb'}1A`, color: business.branding?.primaryColor || '#2563eb' }}>
              {business.category}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
            {business.contactName ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                <Phone size={14} className="text-slate-500" />
                {business.contactName}
              </div>
            ) : null}
            {business.contactNumber ? (
              <a
                href={`tel:${String(business.contactNumber).replace(/[^\d+]/g, '')}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
              >
                <Phone size={14} className="text-slate-500" />
                {business.contactNumber}
              </a>
            ) : null}
            {business.location ? (
              <a
                href={buildBusinessLocationHref(business.location, business.locationLink)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
              >
                <MapPin size={14} className="text-slate-500" />
                {business.location}
              </a>
            ) : null}
          </div>

          <p className="mt-5 max-w-2xl text-slate-600">{business.welcomeMessage}</p>
        </header>

        <main className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft md:p-6">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">How was your experience?</p>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">Business summary</label>
              <textarea
                value={businessSummary}
                onChange={(event) => setBusinessSummary(event.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                placeholder="Neighborhood café known for artisan coffee, brunch, and a warm modern atmosphere."
              />
            </div>

            <div className="mb-6">
              <p className="mb-3 text-sm font-medium text-slate-700">Choose what mattered most</p>
              <div className="flex flex-wrap gap-2">
                {totalCategories.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleCategory(item.key)}
                    className={`rounded-full border px-3 py-2 text-sm transition ${selectedCategories.includes(item.key)
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'}`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Tone</label>
                <select
                  value={tone}
                  onChange={(event) => setTone(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                >
                  {tones.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Language</label>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                >
                  {languages.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 font-semibold text-white shadow-soft transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Sparkles size={18} />
                {isGenerating ? 'Generating...' : 'Generate review'}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!reviewText}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Copy size={18} /> Copy
              </button>
            </div>
          </section>

          <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft md:p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Generated review</p>
              <button type="button" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                <PencilLine size={14} /> Edit
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-700">
              {business.contactName && business.location ? `Personalized for ${business.contactName} • ${business.location}` : 'Personalized review draft'}
            </div>

            <textarea
              value={reviewText || 'Your review will appear here after generation.'}
              onChange={(event) => setReviewText(event.target.value)}
              rows={12}
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Regenerate
              </button>
              <button
                type="button"
                onClick={handleGoogleRedirect}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 font-medium text-white shadow-soft transition hover:bg-emerald-600"
              >
                <Link2 size={16} /> Review on Google
              </button>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
