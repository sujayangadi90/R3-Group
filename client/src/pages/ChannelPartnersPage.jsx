import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Handshake, Phone, User, Building2 } from 'lucide-react';
import { api } from '../services/api';

export const ChannelPartnersPage = () => {
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);

  const [formData, setFormData] = useState({
    partnerName: '',
    partnerPhone: '',
    partnerEmail: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    propertyId: 'not_sure',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.getProperties({ limit: 100 });
        if (res.success && res.data) {
          setProperties(res.data);
        }
      } catch (err) {
        console.error('Failed to load properties:', err);
      } finally {
        setLoadingProps(false);
      }
    };
    fetchProperties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.partnerName.trim() || !formData.partnerPhone.trim()) {
      setError('Channel Partner Name and Phone are required.');
      return;
    }
    if (!/^\d{10}$/.test(formData.partnerPhone.trim())) {
      setError('Please enter a valid 10-digit Channel Partner phone number.');
      return;
    }
    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      setError('Customer Name and Phone are required.');
      return;
    }
    if (!/^\d{10}$/.test(formData.customerPhone.trim())) {
      setError('Please enter a valid 10-digit Customer phone number.');
      return;
    }

    const selectedProp = properties.find((p) => p._id === formData.propertyId);
    const isNotSure = formData.propertyId === 'not_sure' || !selectedProp;

    const partnerDetails = [
      `Channel Partner: ${formData.partnerName.trim()}`,
      `Partner Phone: ${formData.partnerPhone.trim()}`,
      formData.partnerEmail.trim() ? `Partner Email: ${formData.partnerEmail.trim()}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    const fullMessage = formData.message.trim()
      ? `${formData.message.trim()}\n\n[${partnerDetails}]`
      : `[${partnerDetails}]`;

    try {
      setSubmitting(true);
      const res = await api.submitEnquiry({
        type: 'general',
        name: formData.customerName.trim(),
        phone: formData.customerPhone.trim(),
        email: formData.customerEmail.trim(),
        propertyId: isNotSure ? null : selectedProp._id,
        propertyTitle: isNotSure ? 'Not Sure' : selectedProp.title,
        leadSource: formData.partnerName.trim(),
        brokerName: formData.partnerName.trim(),
        message: fullMessage,
      });

      if (res.success) {
        setSubmitted(true);
        setFormData({
          partnerName: '',
          partnerPhone: '',
          partnerEmail: '',
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          propertyId: 'not_sure',
          message: '',
        });
      } else {
        setError(res.message || 'Failed to register lead. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider">
            <Handshake className="w-3.5 h-3.5" />
            Channel Partners
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
            Register the Lead
          </h1>
          <p className="text-sm text-charcoal-500 max-w-xl mx-auto">
            Submit your client’s details below. Our advisory desk will coordinate the site visit and keep you updated.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-[#ECECE8] shadow-sm p-6 sm:p-10">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
              <h2 className="text-2xl font-bold text-primary">Lead Registered Successfully</h2>
              <p className="text-sm text-charcoal-600 max-w-md mx-auto">
                Thank you! The customer enquiry has been logged under your Channel Partner name and our team will reach out shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-black transition-colors"
              >
                Register Another Lead
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              {/* Channel Partner Details */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Handshake className="w-4 h-4 text-gold" />
                  Channel Partner Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-charcoal-600 uppercase tracking-wider mb-1">
                      Channel Partner Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter channel partner name"
                      value={formData.partnerName}
                      onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-600 uppercase tracking-wider mb-1">
                      Channel Partner Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        placeholder="10-digit mobile number"
                        value={formData.partnerPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            partnerPhone: e.target.value.replace(/\D/g, '').slice(0, 10),
                          })
                        }
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-600 uppercase tracking-wider mb-1">
                      Channel Partner Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="partner@example.com"
                      value={formData.partnerEmail}
                      onChange={(e) => setFormData({ ...formData, partnerEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                  <User className="w-4 h-4 text-gold" />
                  Customer Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-charcoal-600 uppercase tracking-wider mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter customer full name"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-600 uppercase tracking-wider mb-1">
                      Customer Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        placeholder="10-digit mobile number"
                        value={formData.customerPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10),
                          })
                        }
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-600 uppercase tracking-wider mb-1">
                      Customer Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-charcoal-600 uppercase tracking-wider mb-1">
                      Property Interested In
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={formData.propertyId}
                        onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                        disabled={loadingProps}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-primary"
                      >
                        <option value="not_sure">Not Sure</option>
                        {properties.map((prop) => (
                          <option key={prop._id} value={prop._id}>
                            {prop.title} {prop.city ? `(${prop.city})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-charcoal-600 uppercase tracking-wider mb-1">
                      Message (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Any specific requirements, budget, or preferred visit date..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold/90 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Registering Lead...' : 'Register Lead'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
