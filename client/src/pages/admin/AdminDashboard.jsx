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
  FileText,
  Calendar,
  CalendarClock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AdminEnquiries } from './AdminEnquiries';
import { AdminSellRequests } from './AdminSellRequests';
import { AdminSiteVisits } from './AdminSiteVisits';
import { AdminScheduledFollowUps } from './AdminScheduledFollowUps';
import { AdminProperties } from './AdminProperties';
import { AdminSettings } from './AdminSettings';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('enquiries'); // 'enquiries' | 'sellRequests' | 'siteVisits' | 'scheduledFollowUps' | 'properties' | 'settings'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProperties: 0,
    featuredProperties: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    breakdown: {
      siteVisits: 0,
      followUps: 0,
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
      <div className="lg:hidden bg-[#1A1A1A] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 border-b border-[#2E2E2E]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-lg p-1 shadow-sm">
              <img
                src="/r3_logo.png"
                alt="R3 Group Logo"
                className="h-6 w-auto object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-xs text-white block leading-tight">Admin Terminal</span>
              <span className="text-[10px] text-gold font-semibold block leading-tight">
                {activeTab === 'enquiries'
                  ? 'Enquiries Desk'
                  : activeTab === 'sellRequests'
                  ? 'Sell Property Req'
                  : activeTab === 'properties'
                  ? 'Properties'
                  : 'Settings'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gold transition-colors"
            title="View Live Website"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VERTICAL SIDEBAR NAVIGATION */}
      {/* ========================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#1A1A1A] text-white border-r border-[#2E2E2E] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 shadow-2xl lg:shadow-none ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Header */}
        <div>
          <div className="p-5 sm:p-6 border-b border-[#2A2A2A] flex items-center justify-between bg-[#141414]">
            <Link to="/" target="_blank" className="flex items-center gap-3">
              <div className="bg-white rounded-xl p-1.5 shadow-sm">
                <img
                  src="/r3_logo.png"
                  alt="R3 Group Logo"
                  className="h-9 sm:h-10 w-auto object-contain"
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
              className="lg:hidden p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Navigation Menu"
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
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
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

                {/* 2. Sell Property Req */}
                <button
                  onClick={() => {
                    setActiveTab('sellRequests');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'sellRequests'
                      ? 'bg-gold text-white shadow-md'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-4 h-4 ${activeTab === 'sellRequests' ? 'text-white' : 'text-gold'}`} />
                    <span>2. Sell Property Req</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'sellRequests'
                        ? 'bg-white text-gold'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {stats.breakdown?.sellSubmissions || 0}
                  </span>
                </button>

                {/* 3. Site Visits */}
                <button
                  onClick={() => {
                    setActiveTab('siteVisits');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'siteVisits'
                      ? 'bg-gold text-white shadow-md'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-4 h-4 ${activeTab === 'siteVisits' ? 'text-white' : 'text-gold'}`} />
                    <span>3. Site Visits</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'siteVisits'
                        ? 'bg-white text-gold'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {stats.breakdown?.siteVisits || 0}
                  </span>
                </button>

                {/* 4. Scheduled Followups */}
                <button
                  onClick={() => {
                    setActiveTab('scheduledFollowUps');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'scheduledFollowUps'
                      ? 'bg-gold text-white shadow-md'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CalendarClock className={`w-4 h-4 ${activeTab === 'scheduledFollowUps' ? 'text-white' : 'text-gold'}`} />
                    <span>4. Scheduled Followups</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'scheduledFollowUps'
                        ? 'bg-white text-gold'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {stats.breakdown?.followUps || 0}
                  </span>
                </button>

                {/* 5. Properties Management */}
                <button
                  onClick={() => {
                    setActiveTab('properties');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'properties'
                      ? 'bg-gold text-white shadow-md'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className={`w-4 h-4 ${activeTab === 'properties' ? 'text-white' : 'text-gold'}`} />
                    <span>5. Properties Management</span>
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

                {/* 6. Settings (User Management) */}
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-gold text-white shadow-md'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-gold'}`} />
                    <span>6. Settings & Users</span>
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
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
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
                : activeTab === 'sellRequests'
                ? '2. Sell Property Requests'
                : activeTab === 'siteVisits'
                ? '3. Scheduled Site Inspections'
                : activeTab === 'scheduledFollowUps'
                ? '4. Scheduled Client Follow-ups'
                : activeTab === 'properties'
                ? '5. Properties Portfolio Management'
                : '6. Settings & Administrator User Management'}
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
            ) : activeTab === 'sellRequests' ? (
              <AdminSellRequests />
            ) : activeTab === 'siteVisits' ? (
              <AdminSiteVisits />
            ) : activeTab === 'scheduledFollowUps' ? (
              <AdminScheduledFollowUps />
            ) : activeTab === 'properties' ? (
              <AdminProperties />
            ) : (
              <AdminSettings />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
