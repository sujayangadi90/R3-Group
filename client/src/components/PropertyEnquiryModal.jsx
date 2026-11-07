import React, { useState } from 'react';
import { X, Send, CheckCircle2, Shield, Phone, Mail, User } from 'lucide-react';
import { api } from '../services/api';

export const PropertyEnquiryModal = ({ property, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !property) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.submitEnquiry({
        type: 'contact',
        subject: `Enquiry for ${property.title}`,
        propertyId: property._id,
        propertyTitle: property.title,
        ...formData,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to submit enquiry. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#191919] px-6 py-5 text-white flex items-center justify-between border-b border-[#2A2A2A]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-gold text-[11px] font-bold uppercase tracking-wider mb-1">
              <Shield className="w-3.5 h-3.5" /> Confidential Advisory Desk
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Enquire About Property</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Property Brief Strip */}
        <div className="bg-surface-warm px-6 py-3 border-b border-gray-200 flex items-center justify-between text-xs">
          <div className="truncate mr-3">
            <span className="font-bold text-primary">{property.title}</span>
            <span className="text-charcoal-500 ml-1.5">
              ({property.location}{property.city ? `, ${property.city}` : ''})
            </span>
          </div>
          <span className="font-extrabold text-gold shrink-0">Price on Request</span>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-primary">Enquiry Submitted Successfully</h4>
              <p className="text-sm text-charcoal-600 max-w-sm mx-auto leading-relaxed">
                Thank you, <span className="font-semibold text-primary">{formData.name}</span>. Our private wealth advisor has received your request and will connect with you shortly with complete dossier details.
              </p>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-black transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Singhania"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Phone (+91) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
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
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-charcoal-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Message / Remarks <span className="text-charcoal-400 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Please share pricing details, floor plans, or consultation preferences..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold resize-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>Submit Enquiry</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="mt-2.5 text-[11px] text-center text-charcoal-500">
                  Direct access via R3 Group Luxury Advisory Desk. Strict confidentiality guaranteed.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
