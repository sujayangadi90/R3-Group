import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Maximize2,
  Calendar,
  Building,
  Check,
  ShieldCheck,
  Phone,
  Mail,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

export const PropertyDetailPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Enquiry Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const res = await api.getProperty(id);
        if (res.success && res.data) {
          setProperty(res.data);
          setActiveImageIndex(0);
        }
      } catch (err) {
        console.error('Failed to load property details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
    window.scrollTo(0, 0);
  }, [id]);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await api.submitEnquiry({
        type: 'contact',
        subject: `Enquiry for ${property.title}`,
        propertyId: property._id,
        propertyTitle: property.title,
        ...formData,
      });
      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(res.message || 'Submission failed');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-charcoal-600 font-medium">Loading property dossier...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-surface px-6 text-center">
        <h2 className="text-2xl font-bold text-primary">Property Listing Not Found</h2>
        <p className="text-sm text-charcoal-500 mt-2">The requested property may have been relocated or privatized.</p>
        <Link
          to="/properties"
          className="mt-6 px-6 py-2.5 rounded-lg bg-gold text-white font-semibold text-sm"
        >
          Return to Portfolio
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC1kDiJaHOk5TnCh26sWAhk-EsR8-oofu1tWeKGm3Udw4o-CzqgSzl8e2FEYUyMoZaGm5ALuQemvD0ZtrxFS2hHDUOUcgsL2OBQUtFF1ZE03NL-YyzUr9qONzjdkcvy2VJGz6kwNpJQ7nli_CuniTb6-xukt6ccKY_IsdkaOYi63_-1-31jAOpq-bUQ3f3FJ2gZGL4ZUOy_Tcyf9HxhuGpt9Ez9ksjbW-TGHI2nCA'
  ];

  return (
    <main className="w-full pt-24 pb-24 bg-surface">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-[#ECE7E1] py-3">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between text-xs text-charcoal-500">
          <div className="flex items-center gap-2 truncate">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <Link to="/properties" className="hover:text-gold transition-colors">Properties</Link>
            <span>/</span>
            <span className="text-primary font-semibold truncate">{property.title}</span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="flex items-center gap-1 text-charcoal-500">
              <Eye className="w-3.5 h-3.5" /> {property.viewsCount || 120} views
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-8">
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-gray-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded bg-primary text-white text-[11px] font-bold tracking-wider uppercase">
                {property.propertyType}
              </span>
              <span className="px-2.5 py-1 rounded bg-gold-subtle text-gold text-[11px] font-bold tracking-wider uppercase">
                {property.status}
              </span>
              {property.reraId && (
                <span className="px-2.5 py-1 rounded bg-gray-100 text-charcoal-600 text-[11px] font-semibold tracking-wider">
                  RERA: {property.reraId}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary tracking-tight">
              {property.title}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal-600">
              <MapPin className="w-4 h-4 text-gold shrink-0" />
              <span>{property.address || property.location}{property.city ? `, ${property.city}` : ''}</span>
            </p>
          </div>

          <div className="text-left lg:text-right">
            <span className="text-xs uppercase font-bold text-charcoal-500 block">Pricing</span>
            <span className="text-2xl lg:text-3xl font-extrabold text-gold block font-sans">
              Price on Request
            </span>
            <span className="text-[11px] text-charcoal-500">*Confidential advisory upon verified inquiry</span>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visual */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-900 shadow-luxury group">
              <img
                src={images[activeImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-500"
              />

              {/* Prev / Next controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Indicator */}
              <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                {activeImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnails strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx ? 'border-gold shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Key Specifications Strip */}
            <div className="p-6 rounded-2xl bg-white border border-[#ECECE8] shadow-sm grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div>
                <span className="block text-xs font-semibold text-charcoal-500 uppercase">Configuration</span>
                <span className="text-lg font-bold text-primary mt-0.5 block">
                  {property.bedrooms ? (typeof property.bedrooms === 'string' && property.bedrooms.includes('BHK') ? property.bedrooms : `${property.bedrooms} BHK`) : property.propertyType}
                </span>
              </div>
              {property.carpetArea && property.carpetArea !== 'On Request' && (
                <div>
                  <span className="block text-xs font-semibold text-charcoal-500 uppercase">Carpet Area</span>
                  <span className="text-lg font-bold text-primary mt-0.5 block">
                    {property.carpetArea?.toLocaleString()} sq.ft
                  </span>
                </div>
              )}
              <div>
                <span className="block text-xs font-semibold text-charcoal-500 uppercase">Bathrooms</span>
                <span className="text-lg font-bold text-primary mt-0.5 block">
                  {property.bathrooms ? `${property.bathrooms} ${String(property.bathrooms).toLowerCase().includes('bath') ? '' : 'Baths'}` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-charcoal-500 uppercase">Possession</span>
                <span className="text-lg font-bold text-primary mt-0.5 block">
                  {property.possessionDate || 'Immediate'}
                </span>
              </div>
            </div>

            {/* Multiple Unit Configurations & Dimension Options (If configured) */}
            {property.configurations && property.configurations.length > 0 && (
              <div className="p-8 rounded-2xl bg-white border border-[#ECECE8] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-primary">Available Layouts & Configurations</h2>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Multiple dimensions and bedroom configurations available for this {property.propertyType}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider">
                    {property.configurations.length} Options
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-warm border-b border-gray-100 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Configuration</th>
                        <th className="py-3 px-4">Bathrooms</th>
                        <th className="py-3 px-4">Dimensions</th>
                        <th className="py-3 px-4">Carpet Area</th>
                        <th className="py-3 px-4 text-right">Pricing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {property.configurations.map((item, idx) => (
                        <tr key={idx} className="hover:bg-surface/50">
                          <td className="py-3.5 px-4 font-bold text-primary">{item.bhk}</td>
                          <td className="py-3.5 px-4 text-charcoal-600 font-semibold">{item.bathrooms || '—'}</td>
                          <td className="py-3.5 px-4 text-charcoal-600">{item.dimensions || '—'}</td>
                          <td className="py-3.5 px-4 font-semibold text-primary">{item.carpetArea || '—'}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-gold">Price on Request</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Architectural Overview */}
            <div className="p-8 rounded-2xl bg-white border border-[#ECECE8] shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-primary">Architectural Overview</h2>
              {property.tagline && (
                <p className="text-sm font-semibold text-gold italic">
                  "{property.tagline}"
                </p>
              )}
              <p className="text-sm text-charcoal-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Technical Specifications */}
            {property.specifications && property.specifications.length > 0 && (
              <div className="p-8 rounded-2xl bg-white border border-[#ECECE8] shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-primary">Technical Specifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.specifications.map((spec, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-surface-warm border border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal-500 uppercase">{spec.label}</span>
                      <span className="text-xs font-semibold text-primary">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Residence Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="p-8 rounded-2xl bg-white border border-[#ECECE8] shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-primary">Residence Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-warm">
                      <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-primary">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locality & Commute */}
            {property.localityHighlights && property.localityHighlights.length > 0 && (
              <div className="p-8 rounded-2xl bg-white border border-[#ECECE8] shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-primary">Strategic Locality & Commute</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.localityHighlights.map((loc, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-gold uppercase block">{loc.category}</span>
                        <span className="text-xs font-bold text-primary">{loc.title}</span>
                      </div>
                      <span className="text-xs font-semibold text-charcoal-500 bg-gray-100 px-2.5 py-1 rounded">
                        {loc.distance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Private Desk Lead Capture Form */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-2xl border border-[#ECECE8] shadow-luxury p-6 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-gold text-xs font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" /> Confidential Advisory
                </div>
                <h3 className="text-xl font-bold text-primary">Property Enquiry</h3>
                <p className="text-xs text-charcoal-500 mt-1">
                  Connect with our private wealth advisor for bespoke details and acquisition advisory for {property.title}.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-xl bg-surface-warm border border-gray-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-primary">Enquiry Submitted</h4>
                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    Thank you, {formData.name}. Our private advisory desk has received your enquiry. We will reach out shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', message: '' });
                    }}
                    className="mt-2 text-xs font-bold text-gold hover:underline"
                  >
                    Submit another enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs">{errorMsg}</div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-600 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikramaditya Singhania"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-600 uppercase mb-1">
                      Phone (+91) *
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, phone: val });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-600 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-600 uppercase mb-1">
                      Message / Enquiry Remarks
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Please share details on pricing, floor plans, or consultation preference..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-sm tracking-wide shadow-md transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span>Submit Property Enquiry</span>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-charcoal-500">
                    Direct access via South Mumbai Advisory Desk.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
