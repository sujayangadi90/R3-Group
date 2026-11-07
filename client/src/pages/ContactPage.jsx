import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  Send,
} from 'lucide-react';
import { api } from '../services/api';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Asset Acquisition Advisory',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'How does R3 Group maintain confidentiality for high-profile clients?',
      a: 'We operate under strict Non-Disclosure Agreements (NDAs). Buyer and seller identities are blinded during early inquiries, and site visits are coordinated with private executive escort and pre-cleared access passes.',
    },
    {
      q: 'Are all properties listed with R3 Group RERA certified?',
      a: 'Yes. Every project and secondary asset featured in our portfolio is thoroughly audited for valid RERA registration, Commencement Certificates (CC), Occupancy Certificates (OC), and unencumbered title deeds.',
    },
    {
      q: 'Do you manage off-market and private pocket listings?',
      a: 'Yes. A significant portion of our ultra-luxury transactions never appear in public domain catalogs. We maintain direct fiduciary mandates with family offices and developers for confidential placements.',
    },
    {
      q: 'Can R3 Group assist with repatriation and NRI real estate taxation?',
      a: 'Our in-house legal and chartered advisory network assists NRIs and overseas corporate entities with FEMA regulations, 195/197 lower TDS tax exemptions, NRE/NRO banking, and seamless title registration.',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit contact mobile number.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.submitEnquiry({
        type: 'contact',
        ...formData,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to submit enquiry. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please verify your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full pt-24 pb-24 bg-surface min-h-screen">
      {/* Page Header */}
      <section className="bg-primary text-white py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold text-gold uppercase tracking-widest block">Direct Communications Desk</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Connect With Our Advisory Partners
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              We welcome private inquiries from prospective buyers, property owners, and institutional real estate allocators.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-[#ECECE8] shadow-sm space-y-6">
              <div>
                <span className="text-xs font-bold text-gold uppercase tracking-widest">Headquarters</span>
                <h3 className="text-xl font-bold text-primary mt-1">R3 Group Real Estate Advisory</h3>
                <p className="text-xs text-charcoal-500 mt-1">Bangalore Private Advisory Desk</p>
              </div>

              <div className="space-y-4 pt-2 border-t border-gray-100 text-sm text-charcoal-700">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-surface-warm text-gold flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-charcoal-500 uppercase">Registered Office</span>
                    <span className="text-xs font-semibold text-primary block mt-0.5 leading-relaxed">
                      Wasa plaza, 2nd floor, Doddanekkundi, near Srikrishna temple, Karthik Nagar, Marathahalli, Bangalore - 560037
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-surface-warm text-gold flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-charcoal-500 uppercase">Telephone Concierge</span>
                    <a href="tel:+917676759595" className="text-xs font-semibold text-primary hover:text-gold block mt-0.5">
                      +91 76767 59595
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-surface-warm text-gold flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-charcoal-500 uppercase">Secure Correspondence</span>
                    <a href="mailto:Info@r3group.co.in" className="text-xs font-semibold text-primary hover:text-gold block mt-0.5">
                      Info@r3group.co.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-surface-warm text-gold flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-charcoal-500 uppercase">Desk Hours</span>
                    <span className="text-xs font-semibold text-primary block mt-0.5">
                      Monday – Saturday: 09:30 AM – 07:30 PM IST
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidentiality Commitment */}
            <div className="p-6 rounded-2xl bg-surface-warm border border-gray-200 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-primary">Confidentiality Guarantee</h4>
                <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                  Every inquiry received is processed exclusively by accredited senior partners. We never market or distribute private client data to third-party telemarketers.
                </p>
              </div>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-2xl border border-[#ECECE8] shadow-luxury">
              {success ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary">Enquiry Received</h3>
                  <p className="text-sm text-charcoal-600 max-w-sm mx-auto leading-relaxed">
                    Thank you, <span className="font-semibold text-primary">{formData.name}</span>. An advisory partner has been notified and will connect with you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        subject: 'Asset Acquisition Advisory',
                        message: '',
                      });
                    }}
                    className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-black transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <span className="text-xs font-bold text-gold uppercase tracking-widest">Inquiry Form</span>
                    <h2 className="text-2xl font-bold text-primary mt-1">Send Us An Enquiry</h2>
                    <p className="text-xs text-charcoal-500 mt-1">
                      Please outline your requirement so our appropriate desk partner can prepare pertinent dossier files.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs border border-red-200">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikramaditya Singhania"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                        Contact Mobile (+91) *
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
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Corporate / Work Email <span className="text-charcoal-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Advisory Discipline / Interest *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                    >
                      <option>Asset Acquisition Advisory (Buying)</option>
                      <option>Private Asset Divestment (Selling)</option>
                      <option>Off-Market Trophy Penthouse Inquiries</option>
                      <option>Commercial Floorplate & Yield Investment</option>
                      <option>General Real Estate Consultation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Message / Requirement Summary *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Provide target locations, budget ranges, or specific criteria..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Dispatch Advisory Request</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-charcoal-500 text-center">
                    All correspondence is protected under mutual non-disclosure standards.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-gold uppercase tracking-widest">Knowledge Base</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mt-1">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-[#ECECE8] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-primary hover:text-gold transition-colors text-sm sm:text-base"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-gold shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-charcoal-500 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-charcoal-600 border-t border-gray-100 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};
