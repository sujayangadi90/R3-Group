import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Phone,
  Mail,
  Building2,
  CheckCircle,
  X,
  Save,
  Download,
  AlertCircle,
  RotateCcw,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
  '08:00 PM',
];

export const AdminSiteVisits = () => {
  const { user: currentUser } = useAuth();
  const [siteVisits, setSiteVisits] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, Scheduled, Completed, Cancelled, No Show

  // Pagination state (20 records per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Date Filter State - defaults to 'thisMonth'
  const [datePreset, setDatePreset] = useState('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Selected visit for Inspection / Reschedule Modal
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');
  const [reschedulePropertyId, setReschedulePropertyId] = useState('');
  const [rescheduleStatus, setRescheduleStatus] = useState('Scheduled');
  const [savingVisit, setSavingVisit] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Compute start & end dates based on preset
  const getDateRange = () => {
    const now = new Date();
    if (datePreset === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      return { startDate: start, endDate: '' };
    }
    if (datePreset === 'yesterday') {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      const start = new Date(yest.getFullYear(), yest.getMonth(), yest.getDate()).toISOString();
      const end = new Date(yest.getFullYear(), yest.getMonth(), yest.getDate(), 23, 59, 59, 999).toISOString();
      return { startDate: start, endDate: end };
    }
    if (datePreset === '7days') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      return { startDate: new Date(past.getFullYear(), past.getMonth(), past.getDate()).toISOString(), endDate: '' };
    }
    if (datePreset === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      return { startDate: start, endDate: '' };
    }
    if (datePreset === 'custom') {
      return {
        startDate: customStartDate ? new Date(customStartDate).toISOString() : '',
        endDate: customEndDate ? new Date(customEndDate).toISOString() : '',
      };
    }
    return { startDate: '', endDate: '' }; // 'all'
  };

  const fetchSiteVisits = async (page = currentPage) => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const res = await api.getEnquiries({
        isSiteVisit: 'true',
        siteVisitStatus: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm,
        startDate,
        endDate,
        page,
        limit: 20,
      });

      if (res.success && res.data) {
        setSiteVisits(res.data);
        if (res.totalPages !== undefined) setTotalPages(res.totalPages || 1);
        if (res.total !== undefined) setTotalCount(res.total || res.data.length);
      }
    } catch (err) {
      console.error('Failed to load scheduled site visits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [propsRes, usersRes] = await Promise.all([
          api.getProperties({ limit: 100 }),
          api.getAdminUsers ? api.getAdminUsers() : Promise.resolve({ success: false }),
        ]);
        if (propsRes.success && propsRes.data) setPropertiesList(propsRes.data);
        if (usersRes.success && usersRes.data) setAdminUsers(usersRes.data);
      } catch (err) {
        console.error('Failed to load auxiliary properties or reps:', err);
      }
    };
    loadPrerequisites();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchSiteVisits(1);
  }, [datePreset, customStartDate, customEndDate, statusFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchSiteVisits(newPage);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSiteVisits(1);
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      const res = await api.updateEnquiry(id, { siteVisitStatus: newStatus });
      if (res.success) {
        setSiteVisits((prev) =>
          prev.map((item) => (item._id === id ? { ...item, siteVisitStatus: newStatus } : item))
        );
        if (selectedVisit && selectedVisit._id === id) {
          setSelectedVisit((prev) => ({ ...prev, siteVisitStatus: newStatus }));
        }
      }
    } catch (err) {
      console.error('Failed to update visit status:', err);
      alert('Error updating status.');
    }
  };

  const openVisitModal = (visit) => {
    setSelectedVisit(visit);
    setEditingNotes(visit.adminNotes || '');
    setRescheduleDate(visit.preferredDate || '');
    setRescheduleTime(visit.preferredTime || '11:00 AM');
    setReschedulePropertyId(visit.propertyId?._id || visit.propertyId || '');
    setRescheduleStatus(visit.siteVisitStatus || 'Scheduled');
    setSuccessMsg('');
  };

  const handleSaveVisitDetails = async (e) => {
    e.preventDefault();
    if (!selectedVisit) return;
    setSavingVisit(true);
    setSuccessMsg('');

    const targetProp = propertiesList.find((p) => p._id === reschedulePropertyId);
    const targetTitle = targetProp ? targetProp.title : (selectedVisit.propertyTitle || 'General Viewing');

    try {
      const payload = {
        preferredDate: rescheduleDate,
        preferredTime: rescheduleTime,
        siteVisitStatus: rescheduleStatus,
        propertyId: reschedulePropertyId || selectedVisit.propertyId,
        propertyTitle: targetTitle,
        adminNotes: editingNotes,
      };

      const res = await api.updateEnquiry(selectedVisit._id, payload);
      if (res.success) {
        const updated = {
          ...selectedVisit,
          ...payload,
        };
        setSelectedVisit(updated);
        setSiteVisits((prev) =>
          prev.map((item) => (item._id === selectedVisit._id ? updated : item))
        );
        setSuccessMsg('Site inspection details & schedule saved successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert(res.message || 'Failed to update site visit.');
      }
    } catch (err) {
      console.error('Failed to save visit changes:', err);
      alert('Network error updating visit.');
    } finally {
      setSavingVisit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheduled site visit record?')) return;
    try {
      const res = await api.deleteEnquiry(id);
      if (res.success) {
        setSiteVisits((prev) => prev.filter((item) => item._id !== id));
        if (selectedVisit && selectedVisit._id === id) {
          setSelectedVisit(null);
        }
      }
    } catch (err) {
      alert('Failed to delete record.');
    }
  };

  // Status Badge Helper
  const getVisitStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'No Show':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Scheduled':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const isSuperAdmin =
    currentUser?.role === 'Super Admin' ||
    currentUser?.isPrimaryAdmin === true ||
    currentUser?.username?.toLowerCase() === 'admin';

  const exportCSV = () => {
    if (!isSuperAdmin) {
      alert('Access restricted: Only Super Admins can export site visit itineraries.');
      return;
    }
    if (siteVisits.length === 0) return;
    const headers = ['Client Name', 'Phone', 'Email', 'Property Target', 'Visit Date', 'Time Slot', 'Visit Status', 'Assigned Rep', 'Created At'];
    const rows = siteVisits.map((v) => [
      `"${v.name}"`,
      `"${v.phone}"`,
      `"${v.email || ''}"`,
      `"${v.propertyTitle || ''}"`,
      `"${v.preferredDate || ''}"`,
      `"${v.preferredTime || ''}"`,
      `"${v.siteVisitStatus || 'Scheduled'}"`,
      `"${v.assignedToName || ''}"`,
      `"${new Date(v.createdAt).toLocaleDateString('en-IN')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `R3-Group-Site-Visits-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Search, Date Filter & Metrics Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECECE8] shadow-sm space-y-4">
        {/* Row 1: Search & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client name, phone, property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-20 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
            >
              Filter
            </button>
          </form>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-primary hover:bg-gray-50 transition-colors"
              title={isSuperAdmin ? 'Export Site Visit Dossier' : 'Super Admin Only'}
            >
              <Download className="w-3.5 h-3.5 text-gold" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Row 2: Filter Controls (Date Presets + Status Filter) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs">
          {/* Date Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-warm px-3 py-1.5 rounded-xl border border-gray-200/80">
            <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="font-semibold text-charcoal-600">Date:</span>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="bg-transparent font-bold text-primary focus:outline-none cursor-pointer"
            >
              <option value="thisMonth">This Month (Default)</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {/* Custom Date Range Picker */}
          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-gold/40">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="text-xs text-primary focus:outline-none"
              />
              <span className="text-charcoal-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="text-xs text-primary focus:outline-none"
              />
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-surface-warm px-3 py-1.5 rounded-xl border border-gray-200/80">
            <span className="font-semibold text-charcoal-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Site Visits Schedule Table */}
      <div className="bg-white rounded-2xl border border-[#ECECE8] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-primary text-sm">
              Scheduled Site Inspections ({totalCount || siteVisits.length})
            </h3>
            <span className="text-[11px] text-charcoal-400 bg-gray-100 px-2 py-0.5 rounded-full">
              Filtered by Date ({datePreset})
            </span>
          </div>
          <span className="text-xs text-charcoal-500 hidden sm:inline">
            Click row to view itinerary or reschedule visit
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-charcoal-500 text-sm">Loading site visit itineraries...</div>
        ) : siteVisits.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="font-bold text-primary">No site visits scheduled for this timeframe.</p>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
              Visits booked via property pages, site visit booking modals, or enquiries desk will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-warm border-b border-gray-100 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Visit Date & Time</th>
                  <th className="py-3 px-4">Client Contact</th>
                  <th className="py-3 px-4">Target Property</th>
                  <th className="py-3 px-4">Assigned Rep</th>
                  <th className="py-3 px-4">Visit Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {siteVisits.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-surface/60 transition-colors cursor-pointer"
                    onClick={() => openVisitModal(item)}
                  >
                    {/* Visit Date & Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-primary text-xs">
                            {item.preferredDate || 'Date Not Fixed'}
                          </div>
                          <div className="text-[11px] text-charcoal-500 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gold" />
                            <span>{item.preferredTime || '11:00 AM'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Client Contact */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-primary">{item.name}</div>
                      <div className="text-[11px] text-charcoal-600 font-medium flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-gold" />
                        <span>{item.phone}</span>
                      </div>
                      {item.email && (
                        <div className="text-[10px] text-charcoal-400 truncate max-w-[180px]">
                          {item.email}
                        </div>
                      )}
                    </td>

                    {/* Target Property */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-primary">
                        {item.propertyTitle || 'General Private Portfolio'}
                      </div>
                      {item.propertyId?.location && (
                        <div className="text-[11px] text-charcoal-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gold" />
                          <span>{item.propertyId.location}</span>
                        </div>
                      )}
                    </td>

                    {/* Assigned Sales Rep */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-charcoal-600">
                      <div className="font-medium text-xs text-primary">
                        {item.assignedToName || 'Unassigned'}
                      </div>
                    </td>

                    {/* Visit Status Selector */}
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={item.siteVisitStatus || 'Scheduled'}
                        onChange={(e) => handleQuickStatusChange(item._id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer ${getVisitStatusBadge(
                          item.siteVisitStatus || 'Scheduled'
                        )}`}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No Show">No Show</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openVisitModal(item)}
                          className="p-1.5 rounded-lg text-charcoal-500 hover:text-primary hover:bg-gray-100 transition-colors"
                          title="View Itinerary & Reschedule"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Visit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-600 bg-white">
          <div className="text-charcoal-500">
            Showing <strong className="text-primary font-bold">{siteVisits.length > 0 ? (currentPage - 1) * 20 + 1 : 0}</strong> to{' '}
            <strong className="text-primary font-bold">{Math.min(currentPage * 20, totalCount || siteVisits.length)}</strong> of{' '}
            <strong className="text-primary font-bold">{totalCount || siteVisits.length}</strong> site visits (20 / page)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-2 font-bold text-primary">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reschedule & Visit Details Big Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-5 h-5 text-gold" />
                <div>
                  <span className="text-gold text-[10px] font-bold uppercase tracking-wider block">
                    Site Visit Inspection Itinerary
                  </span>
                  <h3 className="text-base font-bold mt-0.5">
                    {selectedVisit.name} — {selectedVisit.propertyTitle || 'Exclusive Viewing'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedVisit(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveVisitDetails} className="p-6 space-y-6 overflow-y-auto flex-1">
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Client & Assigned Rep Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-warm border border-gray-200">
                <div>
                  <span className="text-[10px] font-bold text-charcoal-500 uppercase block mb-1">
                    Client Details
                  </span>
                  <div className="font-bold text-primary text-sm">{selectedVisit.name}</div>
                  <div className="text-xs text-charcoal-600 flex items-center gap-1.5 mt-1 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-gold" />
                    <a href={`tel:${selectedVisit.phone}`} className="hover:underline">
                      {selectedVisit.phone}
                    </a>
                  </div>
                  {selectedVisit.email && (
                    <div className="text-xs text-charcoal-500 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-gold" />
                      <a href={`mailto:${selectedVisit.email}`} className="hover:underline">
                        {selectedVisit.email}
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-charcoal-500 uppercase block mb-1">
                    Assigned Sales Representative
                  </span>
                  <div className="font-bold text-primary text-sm">
                    {selectedVisit.assignedToName || 'Unassigned'}
                  </div>
                  <div className="text-xs text-charcoal-500 mt-1">
                    Lead Status: <span className="font-semibold text-primary">{selectedVisit.status}</span>
                  </div>
                </div>
              </div>

              {/* Reschedule & Visit Particulars Section */}
              <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-blue-700" />
                    <span>Inspection Date, Time & Status</span>
                  </h4>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getVisitStatusBadge(rescheduleStatus)}`}>
                    {rescheduleStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Target Property
                    </label>
                    <select
                      value={reschedulePropertyId}
                      onChange={(e) => setReschedulePropertyId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white text-primary focus:outline-none focus:border-primary cursor-pointer font-medium"
                    >
                      <option value="">
                        {selectedVisit.propertyTitle ? `${selectedVisit.propertyTitle} (Current)` : 'Select Property...'}
                      </option>
                      {propertiesList.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title} ({p.propertyType} - {p.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Visit Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white text-primary focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Time Slot (AM/PM)
                    </label>
                    <select
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-gray-300 text-xs bg-white text-primary focus:outline-none focus:border-primary cursor-pointer font-medium"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Visit Status Radio / Selector */}
                <div className="pt-2 border-t border-blue-200/60">
                  <label className="block text-xs font-semibold text-blue-900 uppercase mb-1.5">
                    Visit Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Scheduled', 'Completed', 'Cancelled', 'No Show'].map((st) => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setRescheduleStatus(st)}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center ${
                          rescheduleStatus === st
                            ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                            : 'bg-white text-charcoal-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Client Message */}
              {selectedVisit.message && (
                <div>
                  <span className="text-[11px] font-bold text-charcoal-500 uppercase block mb-1">
                    Client Remarks / Special Requests
                  </span>
                  <div className="p-3.5 rounded-xl bg-surface-warm border border-gray-200 text-xs text-charcoal-700 leading-relaxed whitespace-pre-line">
                    {selectedVisit.message}
                  </div>
                </div>
              )}

              {/* Advisory Notes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-charcoal-500 uppercase">
                    Site Visit Notes & Executive Observations
                  </span>
                  <span className="text-[11px] text-charcoal-500">Internal only</span>
                </div>
                <textarea
                  rows={3}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Record client visit feedback, architect remarks, units inspected, price expectations..."
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary resize-none"
                ></textarea>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedVisit(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-charcoal-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVisit}
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingVisit ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save & Update Schedule</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
