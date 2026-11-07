import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  TrendingUp,
  FileText,
  CheckCircle2,
  Phone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';

export const SellPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    propertyTitle: '',
    propertyType: 'Penthouse',
    location: '',
    expectedPrice: '',
    carpetArea: '',
    bedrooms: '4',
    additionalNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.submitSellRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        propertyTitle: formData.propertyTitle,
        propertyType: formData.propertyType,
        location: formData.location,
        expectedPrice: formData.expectedPrice,
        carpetArea: formData.carpetArea,
        bedrooms: formData.bedrooms,
        additionalNotes: formData.additionalNotes,
      });

      if (res.success) {
        setSuccess(true);
        window.scrollTo({ top: 300, behavior: 'smooth' });
      } else {
        setError(res.message || 'Submission failed. Please check your information.');
      }
    } catch (err) {
      setError('An error occurred. Please try again or call our direct desk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full pt-24 pb-24 bg-surface min-h-screen">
      {/* Hero Banner */}
      <section className="bg-primary text-white py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-gold" /> Confidential Divestment Desk
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              List Your Ultra-Luxury Asset With Discretion & Precision.
            </h1>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              We connect prominent family offices and high-net-worth investors directly with qualified buyers, bypassing generic aggregators and preserving asset pedigree.
            </p>
          </div>
        </div>
      </section>

      {/* Advisory Advantages */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#ECECE8] shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-subtle text-gold flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-primary text-base">Off-Market Exclusivity</h3>
              <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                Your residence details are shared strictly under non-disclosure agreements with vetted buyers.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#ECECE8] shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-subtle text-gold flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-primary text-base">Institutional Valuation</h3>
              <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                Calculated on real comparable transactions, floor-to-ceiling elevation, and micro-market demand.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#ECECE8] shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-subtle text-gold flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-primary text-base">End-to-End Escrow</h3>
              <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                Complete legal coordination, title deed validation, tax counsel, and registration execution.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Form Container */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-2xl border border-[#ECECE8] shadow-luxury p-8 sm:p-12">
          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-bold text-primary">Asset Dossier Submitted Successfully</h2>
              <p className="text-sm text-charcoal-600 max-w-md mx-auto leading-relaxed">
                Thank you, <span className="font-bold text-primary">{formData.name}</span>. Your asset submission for <span className="font-semibold text-primary">{formData.propertyTitle || 'your luxury property'}</span> has been secured in our private database. A senior advisory partner will reach out within 24 hours.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-black transition-colors"
                >
                  Submit Another Asset
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <span className="text-xs font-bold text-gold uppercase tracking-widest block">Confidential Listing Form</span>
                <h2 className="text-2xl font-bold text-primary mt-1">Property Submission Details</h2>
                <p className="text-xs text-charcoal-500 mt-1">
                  All fields marked with an asterisk (*) are strictly confidential and shared only with our managing partner.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                  {error}
                </div>
              )}

              {/* Owner Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider pb-2 border-b border-gray-100">
                  1. Owner / Representative Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajeshwar Mehta"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Direct Mobile (+91) *
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@familyoffice.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Property Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider pb-2 border-b border-gray-100">
                  2. Property Particulars
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Property Name / Building *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NCPA Apartments Sea Facing Suite"
                      value={formData.propertyTitle}
                      onChange={(e) => setFormData({ ...formData, propertyTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Property Type *
                    </label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                    >
                      <option value="Penthouse">Penthouse</option>
                      <option value="Apartment">Luxury Apartment</option>
                      <option value="Villa">Villa / Bungalow</option>
                      <option value="Commercial">Commercial Floorplate</option>
                      <option value="Plot">Freehold Plot / Land</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Location / Neighborhood *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Worli Sea Face, Mumbai"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Carpet Area (Sq.Ft) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 4,200 sq.ft"
                      value={formData.carpetArea}
                      onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Configuration / Bedrooms
                    </label>
                    <select
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                    >
                      <option value="3">3 BHK</option>
                      <option value="4">4 BHK</option>
                      <option value="5">5 BHK</option>
                      <option value="6+">6+ BHK / Full Mansion</option>
                      <option value="Commercial">Commercial (N/A)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Expected Target Price (₹ Cr or Lakhs) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹ 28.50 Cr or Market Competitive"
                    value={formData.expectedPrice}
                    onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Special Features, Finishes & Title Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Clear sea view, fully fitted Italian kitchen, 4 covered basements, clear freehold title..."
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-sm tracking-wide shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>Submit Property for Confidential Advisory</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="mt-3 text-xs text-center text-charcoal-500">
                  Submissions are reviewed directly by the R3 Managing Partners. Non-disclosure guaranteed.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};
