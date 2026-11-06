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
  ChevronRight,
  Menu,
  X,
  User,
  Settings,
  PlusCircle,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AdminEnquiries } from './AdminEnquiries';
import { AdminProperties } from './AdminProperties';
import { AdminSettings } from './AdminSettings';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('enquiries'); // 'enquiries' | 'properties' | 'settings'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      {/* Mobile Top Header (Mobile only) */}
      <div className="lg:hidden bg-primary text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-[#333333]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-white/10 text-white"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <img
            src="/r3_logo.png"
            alt="R3 Group"
            className="h-8 w-auto object-contain bg-white/10 rounded p-1"
          />
          <span className="font-bold text-xs text-white">Admin Terminal</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            className="p-1.5 rounded-lg bg-white/10 text-gold"
            title="View Live Site"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg bg-white/10 text-red-400"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VERTICAL SIDEBAR NAVIGATION */}
      {/* ========================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#1A1A1A] text-white border-r border-[#2E2E2E] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Header */}
        <div>
          <div className="p-6 border-b border-[#2A2A2A] flex items-center justify-between">
            <Link to="/" target="_blank" className="flex items-center gap-3">
              <div className="bg-white rounded-xl p-1.5 shadow-sm">
                <img
                  src="/r3_logo.png"
                  alt="R3 Group Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-gold uppercase tracking-wider block">
                  Admin Terminal
                </span>
                <span className="text-sm font-bold text-white tracking-tight">
                  R3 Group Advisory
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="px-4 py-6 space-y-6">
            <div>
              <span className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Management Modules
              </span>

              {/* Vertical Menu Links */}
              <nav className="space-y-1.5">
                {/* 1. Enquiries Desk */}
                <button
                  onClick={() => {
                    setActiveTab('enquiries');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                    activeTab === 'enquiries'
                      ? 'bg-gold text-white shadow-md'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Inbox className={`w-4 h-4 ${activeTab === 'enquiries' ? 'text-white' : 'text-gold'}`} />
                    <span>1. Enquiries Desk</span>
                  </div>

                  {stats.newEnquiries > 0 ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        activeTab === 'enquiries'
                          ? 'bg-white text-gold'
                          : 'bg-gold text-white'
                      }`}
                    >
                      {stats.newEnquiries} New
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-normal">
                      {stats.totalEnquiries}
                    </span>
                  )}
                </button>

                {/* 2. Properties Management */}
                <button
                  onClick={() => {
                    setActiveTab('properties');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                    activeTab === 'properties'
                      ? 'bg-gold text-white shadow-md'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className={`w-4 h-4 ${activeTab === 'properties' ? 'text-white' : 'text-gold'}`} />
                    <span>2. Properties Management</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'properties'
                        ? 'bg-white text-gold'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {stats.totalProperties}
                  </span>
                </button>

                {/* 3. Settings (User Management) */}
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                    activeTab === 'settings'
                      ? 'bg-gold text-white shadow-md'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-gold'}`} />
                    <span>3. Settings & Users</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'settings'
                        ? 'bg-white text-gold'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    Access
                  </span>
                </button>
              </nav>
            </div>

            {/* Quick Links Section */}
            <div className="pt-4 border-t border-[#2A2A2A]">
              <span className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Public Controls
              </span>
              <div className="space-y-1">
                <Link
                  to="/"
                  target="_blank"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-gold" />
                    <span>Live Website</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>

                <Link
                  to="/sell"
                  target="_blank"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <PlusCircle className="w-4 h-4 text-gold" />
                    <span>Sell Asset Form</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* User Account / Footer */}
        <div className="p-4 border-t border-[#2A2A2A] bg-[#141414]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-9 h-9 rounded-xl bg-gold/20 text-gold flex items-center justify-center font-bold text-sm shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-white block truncate">
                  {user?.username || 'admin'}
                </span>
                <span className="text-[10px] text-gold uppercase tracking-wider font-semibold block">
                  {user?.role || 'Managing Partner'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        ></div>
      )}

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================= */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex bg-white border-b border-[#ECE7E1] px-8 py-4 items-center justify-between sticky top-0 z-20">
          <div>
            <span className="text-[11px] font-bold text-gold uppercase tracking-widest block">
              Administrative Control Desk
            </span>
            <h1 className="text-xl font-extrabold text-primary tracking-tight">
              {activeTab === 'enquiries'
                ? '1. Enquiries & Mandates Desk'
                : activeTab === 'properties'
                ? '2. Properties Portfolio Management'
                : '3. Settings & Administrator User Management'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 hover:bg-surface-warm text-xs font-bold text-primary transition-colors shadow-sm"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-gold" />
            </Link>

            <div className="h-6 w-px bg-gray-200"></div>

            <span className="text-xs text-charcoal-500 font-medium">
              Signed in as <strong className="text-primary">{user?.username || 'admin'}</strong>
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
          {/* Active Module */}
          <div>
            {activeTab === 'enquiries' ? (
              <AdminEnquiries />
            ) : activeTab === 'properties' ? (
              <div className="space-y-6">
                {/* Properties Portfolio Metrics */}
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
                      <span className="text-xs font-bold text-charcoal-500 uppercase">Featured Spire</span>
                      <Sparkles className="w-4 h-4 text-gold" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-primary">
                      {stats.featuredProperties}
                    </p>
                    <span className="text-[11px] text-charcoal-500 block">Top curated tier</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#ECECE8] shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal-500 uppercase">Site Visits Booked</span>
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

                <AdminProperties />
              </div>
            ) : (
              <AdminSettings />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
