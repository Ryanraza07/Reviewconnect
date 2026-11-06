import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Link2, MapPin, Phone, Sparkles } from 'lucide-react';
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

  const businessLocationHref = business ? buildBusinessLocationHref(business.location, business.locationLink) : '#';
  const businessPhoneHref = business?.contactNumber ? `tel:${String(business.contactNumber).replace(/[^\d+]/g, '')}` : '#';
  const trustStats = [
    { label: 'Local', value: 'Verified', icon: MapPin },
    { label: 'Reviews', value: '200+', icon: Link2 }
  ];

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
      metadata: { tone, language }
    });

    window.open(target, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-gradient-to-br from-blue-500/40 to-cyan-400/30" />
              <div className="space-y-2">
                <div className="h-2.5 w-20 animate-pulse rounded-full bg-slate-700" />
                <div className="h-4 w-32 animate-pulse rounded-full bg-slate-700" />
              </div>
            </div>
            <div className="h-9 w-24 animate-pulse rounded-full bg-slate-800" />
          </div>

          <div className="mb-5 space-y-3">
            <div className="h-3 w-full animate-pulse rounded-full bg-slate-800" />
            <div className="h-3 w-11/12 animate-pulse rounded-full bg-slate-800" />
            <div className="h-3 w-9/12 animate-pulse rounded-full bg-slate-800" />
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                <div className="mb-3 h-10 w-10 animate-pulse rounded-xl bg-slate-800" />
                <div className="h-2.5 w-12 animate-pulse rounded-full bg-slate-700" />
                <div className="mt-2 h-3 w-16 animate-pulse rounded-full bg-slate-700" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 h-2.5 w-28 animate-pulse rounded-full bg-slate-700" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-800" />
            </div>
            <div className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
              Loading
            </div>
          </div>
        </div>
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
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <Toaster position="top-right" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="soft-orb left-[-6rem] top-[-4rem] bg-blue-500/30" />
        <div className="soft-orb right-[-4rem] top-24 bg-cyan-400/20" />
        <div className="soft-orb bottom-[-5rem] left-1/3 bg-violet-500/20" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-4 md:px-6">
        <header
          className="startup-surface motion-fade-up overflow-hidden rounded-[32px] p-5 md:p-6"
          style={{ boxShadow: `0 30px 90px ${business.branding?.primaryColor || '#3b82f6'}28` }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.12),transparent_22%)]" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={business.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=120&q=80'}
                  alt={business.businessName}
                  className="motion-float h-20 w-20 rounded-[22px] border border-white/20 object-cover shadow-[0_18px_34px_rgba(15,23,42,0.24)]"
                />
                <div
                  className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full border-4 border-slate-950 shadow-lg"
                  style={{ backgroundColor: business.branding?.primaryColor || '#3b82f6' }}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Review Connect</p>
                  <span className="h-px w-3 bg-slate-500" />
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-300">
                    {business.category}
                  </span>
                </div>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">{business.businessName}</h1>

                <div className="mt-2 flex items-center gap-3 text-sm text-slate-300">
                  <div className="flex items-center gap-1 text-amber-300">
                    {'★★★★★'}
                  </div>
                  <span className="font-semibold text-white">4.9</span>
                  <span className="text-slate-400">(200+ reviews)</span>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Verified Local
            </div>
          </div>

          <div className="relative mt-5">
            <p className="max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">{business.welcomeMessage}</p>
          </div>

        </header>

        <main className="relative mt-4 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="startup-surface motion-fade-up rounded-[32px] p-4 md:p-5">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">How was it?</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Build your review</h2>
            </div>

            <div className="mb-6">
              <label className="mb-2.5 block text-sm font-semibold text-slate-200">Business summary</label>
              <textarea
                value={businessSummary}
                onChange={(event) => setBusinessSummary(event.target.value)}
                rows={3}
                className="input-surface w-full rounded-2xl px-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-400"
                placeholder="Warm team, smooth experience, and a genuinely welcoming atmosphere."
              />
            </div>

            <div className="mb-6">
              <p className="mb-3 text-sm font-semibold text-slate-200">What mattered most?</p>
              <div className="flex flex-wrap gap-2.5">
                {totalCategories.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleCategory(item.key)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedCategories.includes(item.key)
                      ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-100 shadow-[0_10px_20px_rgba(34,211,238,0.15)]'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10'}`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-sm font-semibold text-slate-200">Tone</label>
                <select
                  value={tone}
                  onChange={(event) => setTone(event.target.value)}
                  className="input-surface w-full rounded-2xl px-4 py-3.5 text-sm text-slate-100"
                >
                  {tones.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-semibold text-slate-200">Language</label>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="input-surface w-full rounded-2xl px-4 py-3.5 text-sm text-slate-100"
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
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-400 px-5 py-3.5 font-bold text-slate-950 shadow-[0_16px_35px_rgba(34,211,238,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Sparkles size={18} />
                {isGenerating ? 'Generating...' : 'Generate review'}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!reviewText}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy size={18} /> Copy
              </button>
            </div>
          </section>

          <aside className="startup-surface motion-fade-up rounded-[32px] p-4 md:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-300">Generated review</p>
                <h3 className="mt-2 text-xl font-bold text-white">Ready to post</h3>
              </div>
              {reviewText ? (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                  {reviewText.length} chars
                </span>
              ) : null}
            </div>

            <textarea
              value={reviewText || 'Your review will appear here after generation.'}
              onChange={(event) => setReviewText(event.target.value)}
              rows={9}
              className="input-surface mt-5 w-full rounded-[24px] px-4 py-4 text-sm leading-relaxed text-slate-100"
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Regenerate
              </button>

              <button
                type="button"
                onClick={handleGoogleRedirect}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-3 font-bold text-slate-950 shadow-[0_15px_35px_rgba(16,185,129,0.28)] transition hover:-translate-y-0.5"
              >
                <Link2 size={16} />
                Post on Google
              </button>
            </div>
          </aside>
        </main>

        {(business.location || business.contactNumber || business.contactName) && (
          <section className="mt-8">
            <div className="startup-surface motion-fade-up rounded-[32px] p-5 md:p-6">
              <div className="grid gap-5 md:grid-cols-2">
                {business.location ? (
                  <a
                    href={businessLocationHref}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-[24px] border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-500/5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Location</p>
                        <p className="mt-2 text-base font-semibold text-white">{business.location}</p>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300">
                          Get directions
                        </span>
                      </div>
                    </div>
                  </a>
                ) : null}

                {(business.contactNumber || business.contactName) && (
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Contact</p>
                    {business.contactName ? (
                      <p className="mt-2 text-base font-bold text-white">{business.contactName}</p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {business.contactNumber ? (
                        <a
                          href={businessPhoneHref}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-sm font-semibold text-slate-100 transition hover:border-blue-400/40 hover:bg-blue-500/10"
                        >
                          <Phone size={15} className="text-blue-300" />
                          {business.contactNumber}
                        </a>
                      ) : null}

                      {business.location ? (
                        <a
                          href={businessLocationHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/40 hover:bg-cyan-500/10"
                        >
                          <MapPin size={15} className="text-cyan-300" />
                          Map
                        </a>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
