import { useEffect, useState } from 'react';
import { BarChart3, Building2, Globe, Instagram, LogOut, Mail, MapPin, MessageCircle, Phone, QrCode, ShieldCheck, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api, { setAuthToken } from '../services/api';
import { buildBusinessLocationHref } from '../utils/location';

const defaultForm = {
  businessName: '',
  category: 'restaurant',
  contactName: '',
  contactPhone: '',
  email: '',
  location: '',
  locationLink: '',
  businessSummary: '',
  businessProfileJson: '',
  googleReviewUrl: '',
  welcomeMessage: 'We value your feedback and would love to hear about your experience.',
  primaryColor: '#2563eb',
  logo: '',
  website: '',
  instagram: '',
  facebook: '',
  whatsapp: '',
  twitter: '',
  youtube: '',
  linkedin: ''
};

const defaultReviewCategoriesByType = {
  restaurant: [
    { key: 'staff', name: 'Staff behaviour' },
    { key: 'overall', name: 'Overall experience' },
    { key: 'foodquality', name: 'Food quality' },
    { key: 'taste', name: 'Taste' },
    { key: 'ambience', name: 'Ambience' },
    { key: 'cleanliness', name: 'Cleanliness' },
    { key: 'service', name: 'Service quality' },
    { key: 'affordability', name: 'Pricing' },
    { key: 'location', name: 'Location' },
    { key: 'hygiene', name: 'Hygiene' },
    { key: 'freshness', name: 'Freshness' },
    { key: 'comfort', name: 'Comfort' }
  ],
  salon: [
    { key: 'staff', name: 'Staff behaviour' },
    { key: 'overall', name: 'Overall experience' },
    { key: 'service', name: 'Service quality' },
    { key: 'ambience', name: 'Ambience' },
    { key: 'cleanliness', name: 'Cleanliness' },
    { key: 'affordability', name: 'Pricing' },
    { key: 'professionalism', name: 'Professionalism' },
    { key: 'styling', name: 'Haircut quality' },
    { key: 'aftercare', name: 'Aftercare' },
    { key: 'comfort', name: 'Comfort' },
    { key: 'timing', name: 'Timing' },
    { key: 'consultation', name: 'Consultation quality' }
  ],
  clinic: [
    { key: 'staff', name: 'Staff behaviour' },
    { key: 'overall', name: 'Overall experience' },
    { key: 'service', name: 'Service quality' },
    { key: 'cleanliness', name: 'Cleanliness' },
    { key: 'professionalism', name: 'Doctor communication' },
    { key: 'appointment', name: 'Appointment experience' },
    { key: 'facility', name: 'Facility' },
    { key: 'treatment', name: 'Treatment quality' },
    { key: 'communication', name: 'Communication clarity' },
    { key: 'comfort', name: 'Comfort' },
    { key: 'waiting', name: 'Waiting time' },
    { key: 'accessibility', name: 'Accessibility' }
  ],
  general_store: [
    { key: 'staff', name: 'Staff behaviour' },
    { key: 'overall', name: 'Overall experience' },
    { key: 'variety', name: 'Product variety & stock' },
    { key: 'affordability', name: 'Pricing & value' },
    { key: 'billing', name: 'Billing speed & checkout' },
    { key: 'freshness', name: 'Freshness of items' },
    { key: 'cleanliness', name: 'Store cleanliness' },
    { key: 'service', name: 'Customer assistance' },
    { key: 'location', name: 'Location & accessibility' },
    { key: 'discounts', name: 'Offers & discounts' },
    { key: 'organization', name: 'Ease of finding items' },
    { key: 'digitalpayment', name: 'Payment convenience' }
  ],
  optical: [
    { key: 'staff', name: 'Staff behaviour' },
    { key: 'overall', name: 'Overall experience' },
    { key: 'eyetest', name: 'Eye testing accuracy' },
    { key: 'frames', name: 'Frame collection & variety' },
    { key: 'lenses', name: 'Lens quality & clarity' },
    { key: 'affordability', name: 'Pricing & value' },
    { key: 'delivery', name: 'On-time delivery' },
    { key: 'fitting', name: 'Frame fitting & comfort' },
    { key: 'cleanliness', name: 'Store cleanliness' },
    { key: 'service', name: 'Customer service' },
    { key: 'consultation', name: 'Optometrist guidance' },
    { key: 'warranty', name: 'After-sales & warranty' }
  ],
  pharmacy: [
    { key: 'staff', name: 'Pharmacist behaviour' },
    { key: 'overall', name: 'Overall experience' },
    { key: 'availability', name: 'Medicine availability' },
    { key: 'billing', name: 'Quick billing & packing' },
    { key: 'affordability', name: 'Genuine rates & discounts' },
    { key: 'cleanliness', name: 'Store hygiene & storage' },
    { key: 'guidance', name: 'Prescription guidance' },
    { key: 'delivery', name: 'Home delivery service' },
    { key: 'digitalpayment', name: 'Payment options' },
    { key: 'location', name: 'Location convenience' },
    { key: 'genuineness', name: 'Genuine medicines' },
    { key: 'emergency', name: 'Prompt assistance' }
  ],
  electronics: [
    { key: 'staff', name: 'Staff behaviour' },
    { key: 'overall', name: 'Overall experience' },
    { key: 'product_range', name: 'Gadget variety & stock' },
    { key: 'genuineness', name: '100% genuine products' },
    { key: 'affordability', name: 'Best pricing & deals' },
    { key: 'demo', name: 'Product demo & guidance' },
    { key: 'service', name: 'Customer service' },
    { key: 'billing', name: 'Quick billing & invoice' },
    { key: 'warranty', name: 'Warranty & guarantee' },
    { key: 'payment', name: 'EMI & payment options' },
    { key: 'ambience', name: 'Store display & ambience' },
    { key: 'aftersales', name: 'After-sales support' }
  ],
  fashion: [
    { key: 'staff', name: 'Staff assistance' },
    { key: 'overall', name: 'Overall experience' },
    { key: 'collection', name: 'Latest design collection' },
    { key: 'fabric', name: 'Fabric & stitching quality' },
    { key: 'fitting', name: 'Trial room & fitting' },
    { key: 'affordability', name: 'Reasonable pricing' },
    { key: 'variety', name: 'Color & size variety' },
    { key: 'ambience', name: 'Showroom ambience' },
    { key: 'billing', name: 'Smooth billing' },
    { key: 'alteration', name: 'Alteration service' },
    { key: 'discounts', name: 'Seasonal discounts' },
    { key: 'cleanliness', name: 'Store neatness' }
  ],
  gym: [
    { key: 'staff', name: 'Staff & trainer behaviour' },
    { key: 'overall', name: 'Overall experience' },
    { key: 'equipment', name: 'Modern workout machines' },
    { key: 'cleanliness', name: 'Hygiene & sanitization' },
    { key: 'trainers', name: 'Certified trainer guidance' },
    { key: 'ambience', name: 'Music & workout vibe' },
    { key: 'affordability', name: 'Membership pricing' },
    { key: 'space', name: 'Spacious workout floor' },
    { key: 'ventilation', name: 'AC & ventilation' },
    { key: 'crowd', name: 'Crowd management' },
    { key: 'facilities', name: 'Lockers & changing rooms' },
    { key: 'timings', name: 'Flexible operating hours' }
  ],
  automobile: [
    { key: 'staff', name: 'Mechanic behaviour' },
    { key: 'overall', name: 'Overall experience' },
    { key: 'expertise', name: 'Mechanical expertise' },
    { key: 'turnaround', name: 'Turnaround time' },
    { key: 'transparency', name: 'Transparent cost estimate' },
    { key: 'affordability', name: 'Reasonable repair charges' },
    { key: 'genuine_parts', name: 'Genuine spare parts' },
    { key: 'cleanliness', name: 'Washing & cleanup' },
    { key: 'service', name: 'Service quality' },
    { key: 'pickup_drop', name: 'Pickup & drop facility' },
    { key: 'diagnostics', name: 'Accurate problem diagnosis' },
    { key: 'updates', name: 'Timely status updates' }
  ],
  hotel: [
    { key: 'staff', name: 'Staff hospitality' },
    { key: 'overall', name: 'Overall stay experience' },
    { key: 'rooms', name: 'Room cleanliness & comfort' },
    { key: 'bedding', name: 'Bedding & linen quality' },
    { key: 'bathroom', name: 'Clean bathrooms & hot water' },
    { key: 'checkin', name: 'Fast check-in & check-out' },
    { key: 'food', name: 'Room service & breakfast' },
    { key: 'location', name: 'Location & accessibility' },
    { key: 'affordability', name: 'Value for money' },
    { key: 'wifi', name: 'High-speed Wi-Fi & AC' },
    { key: 'parking', name: 'Safe parking facility' },
    { key: 'safety', name: 'Security & peaceful stay' }
  ]
};

const buildDefaultReviewCategories = (category = 'restaurant') => (
  defaultReviewCategoriesByType[category] || defaultReviewCategoriesByType.restaurant
).map((item) => ({ ...item, enabled: true }));

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('reviewConnectToken') || '');
  const [loggedIn, setLoggedIn] = useState(Boolean(token));
  const [loginForm, setLoginForm] = useState({ email: 'admin@reviewconnect.dev', password: 'admin123' });
  const [businesses, setBusinesses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [editingBusinessId, setEditingBusinessId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      loadAdminData();
    }
  }, [token]);

  const loadAdminData = async () => {
    try {
      const [businessRes, analyticsRes] = await Promise.all([
        api.get('/admin/businesses'),
        api.get('/admin/analytics')
      ]);
      setBusinesses(businessRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      toast.error('Your session has expired. Please log in again.');
      handleLogout();
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post('/admin/auth/login', loginForm);
      localStorage.setItem('reviewConnectToken', data.token);
      setToken(data.token);
      setLoggedIn(true);
      setAuthToken(data.token);
      toast.success('Admin login successful.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('reviewConnectToken');
    setToken('');
    setLoggedIn(false);
    setAuthToken(null);
    setBusinesses([]);
    setAnalytics(null);
  };

  const handleCreateBusiness = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        contactNumber: form.contactPhone,
        email: form.email,
        socialLinks: {
          website: form.website || '',
          instagram: form.instagram || '',
          facebook: form.facebook || '',
          whatsapp: form.whatsapp || '',
          twitter: form.twitter || '',
          youtube: form.youtube || '',
          linkedin: form.linkedin || ''
        },
        reviewCategories: buildDefaultReviewCategories(form.category),
        supportedLanguages: ['English', 'Hindi', 'Hinglish'],
        templateSettings: { enabled: true, defaultTone: 'natural' },
        isActive: true
      };

      if (editingBusinessId) {
        await api.put(`/admin/businesses/${editingBusinessId}`, payload);
        toast.success('Business updated successfully.');
      } else {
        await api.post('/admin/businesses', payload);
        toast.success('Business created successfully.');
      }

      setForm(defaultForm);
      setEditingBusinessId(null);
      loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || (editingBusinessId ? 'Business update failed.' : 'Business creation failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, logo: String(reader.result || '') }));
      toast.success('Business image uploaded.');
    };
    reader.onerror = () => toast.error('Could not read the selected image.');
    reader.readAsDataURL(file);
  };

  const handleEditBusiness = (business) => {
    setEditingBusinessId(business.id);
    setForm({
      businessName: business.businessName || '',
      category: business.category || 'restaurant',
      contactName: business.contactName || '',
      contactPhone: business.contactNumber || '',
      email: business.email || '',
      location: business.location || '',
      locationLink: business.locationLink || '',
      businessSummary: business.businessSummary || '',
      businessProfileJson: business.businessProfileJson || '',
      googleReviewUrl: business.googleReviewUrl || '',
      welcomeMessage: business.welcomeMessage || 'We value your feedback and would love to hear about your experience.',
      primaryColor: business.branding?.primaryColor || '#2563eb',
      logo: business.logo || '',
      website: business.socialLinks?.website || '',
      instagram: business.socialLinks?.instagram || '',
      facebook: business.socialLinks?.facebook || '',
      whatsapp: business.socialLinks?.whatsapp || '',
      twitter: business.socialLinks?.twitter || '',
      youtube: business.socialLinks?.youtube || '',
      linkedin: business.socialLinks?.linkedin || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this business?')) return;
    try {
      await api.delete(`/admin/businesses/${id}`);
      toast.success('Business deleted.');
      loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed.');
    }
  };

  const publicBaseUrl = typeof window !== 'undefined' ? window.location.origin : (import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173');
  const qrUrl = (slug) => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${publicBaseUrl}/b/${slug}`)}`;

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),transparent_35%),#020817] px-4 text-white">
        <Toaster position="top-right" />
        <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.5)] backdrop-blur-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-indigo-500 font-bold text-white shadow-lg shadow-cyan-500/30">R</div>
            <h1 className="mt-4 text-2xl font-bold">Review Connect Admin</h1>
            <p className="mt-2 text-sm text-slate-400">Manage businesses and review flows</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Email</label>
              <input
                required
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Password</label>
              <input
                required
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:brightness-110">
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),transparent_30%),#f8fafc] text-slate-900">
      <Toaster position="top-right" />
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-3 py-4 sm:px-4 lg:flex-row lg:gap-4 lg:py-5">
        <aside className="hidden w-full rounded-[22px] border border-slate-200/80 bg-slate-950 p-3 text-white shadow-[0_18px_45px_rgba(15,23,42,0.12)] lg:block lg:w-[230px]">
          <div className="mb-5 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-sm font-bold">R</div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.22em] text-slate-400">DevMains</p>
              <h2 className="text-sm font-semibold">Review Connect</h2>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button type="button" onClick={() => scrollToSection('overview-section')} className="flex w-full items-center gap-3 rounded-xl bg-white/5 px-3 py-2 text-left text-sm font-medium text-white transition hover:bg-white/10">
              <Building2 size={15} /> Overview
            </button>
            <button type="button" onClick={() => scrollToSection('business-form-section')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
              <Building2 size={15} /> Businesses
            </button>
            <button type="button" onClick={() => scrollToSection('business-list-section')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
              <QrCode size={15} /> QR Codes
            </button>
            <button type="button" onClick={() => scrollToSection('analytics-section')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
              <BarChart3 size={15} /> Analytics
            </button>
            <button type="button" onClick={handleLogout} className="mt-8 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
              <LogOut size={15} /> Logout
            </button>
          </nav>
        </aside>

        <main className="flex-1 space-y-4">
          <header id="overview-section" className="rounded-[22px] border border-slate-200/80 bg-white/80 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 sm:text-[11px]">Overview</p>
                <h1 className="mt-2 text-2xl font-bold sm:text-[2rem]">Admin dashboard</h1>
              </div>
              <div className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 shadow-sm">Live</div>
            </div>
          </header>

          <section id="analytics-section" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {analytics ? (
              <>
                <div className="rounded-[18px] border border-slate-200/80 bg-white/80 p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.03)] backdrop-blur-sm"><p className="text-sm text-slate-500">Businesses</p><p className="mt-2 text-3xl font-bold">{businesses.length}</p></div>
                <div className="rounded-[18px] border border-slate-200/80 bg-white/80 p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.03)] backdrop-blur-sm"><p className="text-sm text-slate-500">Landing visits</p><p className="mt-2 text-3xl font-bold">{analytics.landingPageVisits || 0}</p></div>
                <div className="rounded-[18px] border border-slate-200/80 bg-white/80 p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.03)] backdrop-blur-sm"><p className="text-sm text-slate-500">Review generations</p><p className="mt-2 text-3xl font-bold">{analytics.reviewGenerations || 0}</p></div>
                <div className="rounded-[18px] border border-slate-200/80 bg-white/80 p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.03)] backdrop-blur-sm"><p className="text-sm text-slate-500">Google clicks</p><p className="mt-2 text-3xl font-bold">{analytics.googleClicks || 0}</p></div>
              </>
            ) : null}
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            <form id="business-form-section" onSubmit={handleCreateBusiness} className="rounded-[22px] border border-slate-200/80 bg-white/80 p-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:p-3">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <ShieldCheck size={18} />
                </div>
                <h2 className="text-xl font-semibold">{editingBusinessId ? 'Edit business' : 'Add a business'}</h2>
              </div>

              <div className="space-y-2.5">
                <div className="grid gap-2.5 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[12px] font-medium text-slate-600">Business name</label>
                    <input value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] font-medium text-slate-600">Category</label>
                    <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10">
                      <option value="restaurant">Restaurant & Café</option>
                      <option value="salon">Salon & Spa</option>
                      <option value="clinic">Clinic & Healthcare</option>
                      <option value="general_store">General Store & Supermarket</option>
                      <option value="optical">Optical Shop & Eyewear</option>
                      <option value="pharmacy">Pharmacy & Medical Store</option>
                      <option value="electronics">Electronics & Mobile Store</option>
                      <option value="fashion">Fashion & Clothing Boutique</option>
                      <option value="gym">Gym & Fitness Center</option>
                      <option value="automobile">Automobile & Garage Service</option>
                      <option value="hotel">Hotel & Hospitality</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-2.5 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[12px] font-medium text-slate-600">Contact name</label>
                    <input value={form.contactName} onChange={(event) => setForm({ ...form, contactName: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10" placeholder="Aisha Khan" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] font-medium text-slate-600">Contact phone / WhatsApp</label>
                    <input value={form.contactPhone} onChange={(event) => setForm({ ...form, contactPhone: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10" placeholder="+91 98765 43210" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Business email</label>
                  <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10" placeholder="hello@yourbusiness.com" />
                </div>

                {/* Social Media Handles & Links Onboarding */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
                    <Globe size={15} className="text-blue-600" />
                    <span className="text-[12px] font-semibold text-slate-800 uppercase tracking-wider">Social Media Handles & Links</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-600">Website URL</label>
                      <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://yourbusiness.com" className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-600">Instagram (@handle or URL)</label>
                      <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@yourbusiness or https://instagram.com/..." className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-600">WhatsApp (Number or Link)</label>
                      <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+91 98765 43210" className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-600">Facebook (Page URL)</label>
                      <input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="https://facebook.com/yourbusiness" className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-600">Twitter / X (@handle or URL)</label>
                      <input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} placeholder="@yourbusiness or https://x.com/..." className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-slate-600">YouTube (Channel URL)</label>
                      <input value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} placeholder="https://youtube.com/@yourbusiness" className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[11px] font-medium text-slate-600">LinkedIn (Profile/Company URL)</label>
                      <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/company/yourbusiness" className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Business location (city/area)</label>
                  <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10" placeholder="Connaught Place, New Delhi" />
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Exact business location link</label>
                  <input value={form.locationLink} onChange={(event) => setForm({ ...form, locationLink: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10" placeholder="https://maps.google.com/?q=your+business+name" />
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Business summary</label>
                  <textarea value={form.businessSummary} onChange={(event) => setForm({ ...form, businessSummary: event.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10" placeholder="Neighborhood café known for artisan coffee and brunch in a warm modern setting." />
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Business profile JSON</label>
                  <textarea value={form.businessProfileJson} onChange={(event) => setForm({ ...form, businessProfileJson: event.target.value })} rows={6} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10" placeholder='{"business_name":"Moonville Rooftop","category":"Rooftop Restaurant","location":"Chandhasi, DDU Nagar, Mughalsarai","cuisine":["North Indian","Mughlai"],"specialties":["Paneer gravies","Tandoori starters"],"experience_highlights":["Rooftop ambience","Family dining"],"customer_feedback_themes":{"positive":["Ambience","Food presentation"],"mixed_or_negative":["Pizza consistency"]},"estimated_price_for_two":"₹800-₹1000"}' />
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Google review URL</label>
                  <input value={form.googleReviewUrl} onChange={(event) => setForm({ ...form, googleReviewUrl: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10" placeholder="https://..." />
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-600">Welcome message</label>
                  <textarea value={form.welcomeMessage} onChange={(event) => setForm({ ...form, welcomeMessage: event.target.value })} rows={3} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10" />
                </div>

                <div className="grid gap-2.5 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[12px] font-medium text-slate-600">Brand color</label>
                    <input type="color" value={form.primaryColor} onChange={(event) => setForm({ ...form, primaryColor: event.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 p-1" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] font-medium text-slate-600">Business image</label>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition file:mr-3 file:rounded-full file:border-0 file:bg-blue-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10" />
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                  <label className="mb-2 block text-[12px] font-medium text-slate-600">Or use image URL</label>
                  <input value={form.logo} onChange={(event) => setForm({ ...form, logo: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10" placeholder="https://..." />
                  {form.logo ? (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={form.logo} alt="Business preview" className="h-14 w-14 rounded-xl object-cover ring-2 ring-slate-200" />
                      <span className="text-xs text-slate-500">Selected image preview</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
                  {editingBusinessId ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBusinessId(null);
                        setForm(defaultForm);
                      }}
                      className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  ) : null}
                  <button type="submit" disabled={isSubmitting} className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
                    {isSubmitting ? 'Saving...' : editingBusinessId ? 'Update business' : 'Create business'}
                  </button>
                </div>
              </div>
            </form>

            <div id="business-list-section" className="space-y-3">
              {businesses.map((business) => (
                <div key={business.id} className="rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_10px_22px_rgba(15,23,42,0.03)] sm:p-3.5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 sm:gap-3">
                      <img src={business.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=120&q=80'} alt={business.businessName} className="h-11 w-11 rounded-xl object-cover sm:h-12 sm:w-12" />
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-slate-900">{business.businessName}</h3>
                        <p className="truncate text-xs text-slate-500">/{business.slug}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <a href={`${publicBaseUrl}/b/${business.slug}`} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100">Open page</a>
                      <button type="button" onClick={() => handleEditBusiness(business)} className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100">Edit</button>
                      <button type="button" onClick={() => handleDelete(business.id)} className="rounded-full border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-slate-600">
                    {business.contactName ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1"><Phone size={11} /> {business.contactName}</span>
                    ) : null}
                    {business.contactNumber ? (
                      <a href={`tel:${String(business.contactNumber).replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 transition hover:bg-slate-200">
                        <Phone size={11} /> {business.contactNumber}
                      </a>
                    ) : null}
                    {business.email ? (
                      <a href={`mailto:${business.email}`} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 transition hover:bg-slate-200">
                        <Mail size={11} /> {business.email}
                      </a>
                    ) : null}
                    {business.location ? (
                      <a
                        href={buildBusinessLocationHref(business.location, business.locationLink)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 transition hover:bg-slate-200"
                      >
                        <MapPin size={11} /> {business.location}
                      </a>
                    ) : null}
                    {business.socialLinks?.website ? (
                      <a href={business.socialLinks.website.startsWith('http') ? business.socialLinks.website : `https://${business.socialLinks.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2 py-1 transition hover:bg-blue-100">
                        <Globe size={11} /> Website
                      </a>
                    ) : null}
                    {business.socialLinks?.instagram ? (
                      <a href={business.socialLinks.instagram.startsWith('http') ? business.socialLinks.instagram : `https://instagram.com/${business.socialLinks.instagram.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-pink-50 text-pink-700 px-2 py-1 transition hover:bg-pink-100">
                        <Instagram size={11} /> Instagram
                      </a>
                    ) : null}
                    {business.socialLinks?.whatsapp ? (
                      <a href={`https://wa.me/${String(business.socialLinks.whatsapp).replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-1 transition hover:bg-emerald-100">
                        <MessageCircle size={11} /> WhatsApp
                      </a>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[190px_1fr]">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <img src={qrUrl(business.slug)} alt={`${business.businessName} QR code`} className="mx-auto h-28 w-28 rounded-lg bg-white p-2 sm:h-32 sm:w-32" />
                      <a
                        href={qrUrl(business.slug)}
                        download={`${business.slug}-qr-code.png`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
                      >
                        Download QR
                      </a>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p className="overflow-wrap-anywhere break-words text-[12px]"><span className="font-semibold text-slate-700">Category:</span> {business.category}</p>
                      <p className="overflow-wrap-anywhere break-words text-[12px]"><span className="font-semibold text-slate-700">Google URL:</span> {business.googleReviewUrl || 'Not set'}</p>
                      <p className="overflow-wrap-anywhere break-words text-[12px]"><span className="font-semibold text-slate-700">Welcome message:</span> {business.welcomeMessage}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(business.reviewCategories || []).map((category) => (
                          <span key={category.key} className="rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-medium text-blue-700">{category.name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
