import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Phone, MapPin, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export const PropertyLandingPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await api.getProperty(id);
        if (res.success && res.data) {
          setProperty(res.data);
        } else {
          setError('Property not found.');
        }
      } catch (err) {
        setError('Unable to load property details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!formData.name.trim() || !formData.phone.trim()) {
      setSubmitError('Please enter your name and phone number.');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setSubmitError('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitEnquiry({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        message: formData.message.trim() || `Enquiry from FB/Insta Landing Page for ${property?.title || 'Property'}`,
        propertyId: property?._id,
        source: 'FB/Insta Landing Page',
      });

      if (res.success) {
        setSubmitted(true);
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        setSubmitError(res.message || 'Failed to submit enquiry. Please try again.');
      }
    } catch (err) {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#ECECE8] p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-primary">Listing Unavailable</h1>
          <p className="text-sm text-charcoal-500 mt-2">{error || 'This property is no longer available.'}</p>
        </div>
      </div>
    );
  }

  const bgImage = property.images && property.images.length > 0 ? property.images[0] : null;

  return (
    <div
      className="min-h-screen relative flex flex-col justify-center py-10 px-4 bg-[#1a1a1a] bg-cover bg-center"
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/65" />

      <div className="relative z-10 max-w-lg w-full mx-auto space-y-6">
        {/* Project Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            R3 Group
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {property.title}
          </h1>
          {(property.locality || property.city) && (
            <p className="text-sm text-gray-200 inline-flex items-center justify-center gap-1">
              <MapPin className="w-4 h-4 text-gold" />
              {[property.locality, property.city].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        {/* Enquiry Form Card */}
        <div className="bg-white rounded-2xl border border-[#ECECE8] shadow-sm p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h2 className="text-xl font-bold text-primary">Thank You!</h2>
              <p className="text-sm text-charcoal-600">
                Your enquiry for <span className="font-semibold text-primary">{property.title}</span> has been received. Our advisor will contact you shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-black transition-colors"
              >
                Submit Another Enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-primary">Enquire Now</h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Share your details to receive pricing, brochure & site visit availability.
                </p>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-charcoal-600 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-charcoal-600 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: digits });
                    }}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-charcoal-600 uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-charcoal-600 uppercase tracking-wider mb-1">
                  Message / Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Preferred configuration, callback time, etc."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gold hover:bg-gold/90 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Submitting...' : 'Request Details'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
