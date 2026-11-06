import { ArrowRight, CheckCircle2, QrCode, BarChart3, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Business-specific QR pages',
    text: 'Each business gets a unique public review page with its own branding, categories, and welcome message.'
  },
  {
    title: 'Template-based generation',
    text: 'No paid AI dependency. Review Connect uses a deterministic sentence engine with local business templates.'
  },
  {
    title: 'Google review redirect',
    text: 'Customers generate, edit, and then continue to the official Google review page without friction.'
  }
];

const sampleBusinesses = [
  { name: 'The Coffee House', slug: 'the-coffee-house', category: 'Restaurant' },
  { name: 'Royal Salon Studio', slug: 'royal-salon-studio', category: 'Salon' },
  { name: 'City Dental Clinic', slug: 'city-dental-clinic', category: 'Clinic' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="mx-auto max-w-7xl px-6 py-6">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-white">
              R
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-300">DevMains</p>
              <p className="text-lg font-semibold">Review Connect</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <Link to="/admin" className="transition hover:text-white">Admin</Link>
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#businesses" className="transition hover:text-white">Businesses</a>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20">
        <section className="grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
              Multi-tenant review platform
            </div>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-white md:text-6xl">
              Turn happy customers into Google reviews without friction.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              Review Connect gives local businesses a branded QR experience that helps customers leave genuine feedback faster, easier, and with less hesitation.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/b/the-coffee-house"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 font-semibold text-white shadow-soft transition hover:opacity-95"
              >
                View demo business <ArrowRight size={18} />
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Admin dashboard
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={16} /> Business-ready</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={16} /> QR-based</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={16} /> No AI cost</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-sm">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-white">
                    T
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Business feedback</p>
                    <h2 className="text-xl font-semibold text-white">The Coffee House</h2>
                  </div>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">Live</div>
              </div>
              <div className="mt-8 rounded-2xl border border-white/10 bg-slate-800/80 p-4">
                <p className="text-sm text-slate-300">How was your experience?</p>
                <div className="mt-3 flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-300">★</span>
                  ))}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-200">
                <span className="rounded-full bg-blue-500/10 px-3 py-1.5">Food quality</span>
                <span className="rounded-full bg-blue-500/10 px-3 py-1.5">Ambience</span>
                <span className="rounded-full bg-blue-500/10 px-3 py-1.5">Service</span>
              </div>
              <div className="mt-5 rounded-2xl bg-slate-700/70 p-4 text-sm text-slate-200">
                “The coffee was fresh, the ambience was calm, and the staff were warm and helpful.”
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-6 py-12 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 shadow-soft">
              <div className="mb-4 inline-flex rounded-2xl bg-blue-500/10 p-3 text-blue-300">
                {feature.title.includes('QR') ? <QrCode size={22} /> : feature.title.includes('Analytics') ? <BarChart3 size={22} /> : <Building2 size={22} />}
              </div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-slate-300">{feature.text}</p>
            </div>
          ))}
        </section>

        <section id="businesses" className="py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white">Sample business pages</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {sampleBusinesses.map((item) => (
              <Link
                key={item.slug}
                to={`/b/${item.slug}`}
                className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 transition hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-slate-900"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-lg font-bold text-white">
                  {item.name.charAt(0)}
                </div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{item.category}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{item.name}</h3>
                <p className="mt-3 text-slate-300">Open the business review page and generate a customer-ready review.</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
