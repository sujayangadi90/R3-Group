import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Inbox,
  LogOut,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  PhoneCall,
  DollarSign,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AdminEnquiries } from './AdminEnquiries';
import { AdminProperties } from './AdminProperties';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('enquiries'); // 'enquiries' | 'properties'
  const [stats, setStats] = useState({
    totalProperties: 0,
    featuredProperties: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    breakdown: {
      siteVisits: 0,
      sellSubmissions: 0,
      contactEnquiries: 0,
    },
  });

  const fetchStats = async () => {
    try {
      const res = await api.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Navbar */}
      <header className="bg-primary text-white border-b border-[#333333] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" target="_blank" className="flex items-center gap-2">
              <img
                src="/r3_logo.png"
                alt="R3 Group Logo"
                className="h-10 sm:h-12 w-auto object-contain bg-white/10 rounded-lg p-1"
              />
            </Link>
            <div className="hidden sm:block border-l border-gray-700 pl-4">
              <span className="text-xs font-bold text-gold uppercase tracking-wider block">
                Administrative Terminal
              </span>
              <span className="text-sm font-semibold text-white">R3 Real Estate Advisory</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-200 transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-gold" />
            </Link>

            <div className="flex items-center gap-3 border-l border-gray-700 pl-4">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-white block">
                  {user?.username || 'admin'}
                </span>
                <span className="text-[10px] text-gold uppercase tracking-wider font-semibold">
                  Managing Partner
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-8">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#ECECE8] shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-500 uppercase">Total Portfolio</span>
              <Building2 className="w-4 h-4 text-gold" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-primary">
              {stats.totalProperties}
            </p>
            <span className="text-[11px] text-charcoal-500 block">
              {stats.featuredProperties} Exclusive Listings
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#ECECE8] shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-500 uppercase">Total Inquiries</span>
              <Inbox className="w-4 h-4 text-gold" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-primary">
              {stats.totalEnquiries}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold block">
              {stats.newEnquiries} Action Required
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#ECECE8] shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-500 uppercase">Site Visits</span>
              <Clock className="w-4 h-4 text-gold" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-primary">
              {stats.breakdown?.siteVisits || 0}
            </p>
            <span className="text-[11px] text-charcoal-500 block">Private inspections</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#ECECE8] shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-500 uppercase">Sell Mandates</span>
              <TrendingUp className="w-4 h-4 text-gold" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-primary">
              {stats.breakdown?.sellSubmissions || 0}
            </p>
            <span className="text-[11px] text-charcoal-500 block">Asset divestment submissions</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#ECE7E1] flex items-center gap-4">
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-all relative ${
              activeTab === 'enquiries'
                ? 'border-gold text-primary'
                : 'border-transparent text-charcoal-500 hover:text-primary'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>1. Enquiries Desk</span>
            {stats.newEnquiries > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-gold text-white text-[10px] font-extrabold">
                {stats.newEnquiries}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-all relative ${
              activeTab === 'properties'
                ? 'border-gold text-primary'
                : 'border-transparent text-charcoal-500 hover:text-primary'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Properties Management</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-charcoal-600 text-[10px] font-bold">
              {stats.totalProperties}
            </span>
          </button>
        </div>

        {/* Active Tab View */}
        <div>
          {activeTab === 'enquiries' ? <AdminEnquiries /> : <AdminProperties />}
        </div>
      </main>
    </div>
  );
};
