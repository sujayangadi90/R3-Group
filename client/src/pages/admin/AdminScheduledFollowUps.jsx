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
  Building,
  CheckCircle,
  FileText,
  DollarSign,
  X,
  Save,
  Download,
  AlertCircle,
  RotateCcw,
  UserCheck,
  User,
  Plus,
  PhoneCall,
  CalendarCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CallLogModal } from '../../components/CallLogModal';

const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
];

export const AdminScheduledFollowUps = () => {
  const { user: currentUser } = useAuth();
  const [followUps, setFollowUps] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [datePreset, setDatePreset] = useState('all'); // 'all', 'today', 'tomorrow', 'thisWeek', 'thisMonth', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Pagination (20 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Call Log Modal State
  const [callLogEnquiry, setCallLogEnquiry] = useState(null);

  // Quick Reschedule / Detail Modal State
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [rescheduleStatus, setRescheduleStatus] = useState('Pending');
  const [rescheduleRepId, setRescheduleRepId] = useState('');
  const [savingReschedule, setSavingReschedule] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState('');

  // Super admin check
  const isSuperAdmin =
    currentUser?.role === 'Super Admin' ||
    currentUser?.isPrimaryAdmin === true ||
    currentUser?.username?.toLowerCase() === 'admin';

  // Load Sales Reps
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.getUsers();
        if (res.success && res.data) {
          setAdminUsers(res.data);
        }
      } catch (err) {
        console.error('Failed to load users for follow-ups desk:', err);
      }
    };
    fetchUsers();
  }, []);

  // Compute date range
  const getDateRange = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (datePreset === 'today') {
      return { startDate: todayStr, endDate: todayStr };
    }
    if (datePreset === 'tomorrow') {
      const tmrw = new Date(now);
      tmrw.setDate(tmrw.getDate() + 1);
      const tmrwStr = tmrw.toISOString().split('T')[0];
      return { startDate: tmrwStr, endDate: tmrwStr };
    }
    if (datePreset === 'thisWeek') {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    }
    if (datePreset === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    }
    if (datePreset === 'custom') {
      return { startDate: customStartDate, endDate: customEndDate };
    }
    return { startDate: '', endDate: '' };
  };

  const fetchFollowUps = async (page = 1) => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const params = {
        isFollowUp: 'true',
        page,
        limit: 20,
      };

      if (statusFilter !== 'all') params.followUpStatus = statusFilter;
      if (assignedFilter !== 'all') params.assignedTo = assignedFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.getEnquiries(params);
      if (res.success) {
        setFollowUps(res.data || []);
        setTotalCount(res.total || 0);
        setTotalPages(Math.ceil((res.total || 0) / 20) || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Failed to fetch scheduled followups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps(1);
  }, [statusFilter, assignedFilter, datePreset, customStartDate, customEndDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFollowUps(1);
  };

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      const res = await api.updateEnquiry(enquiryId, { followUpStatus: newStatus });
      if (res.success) {
        setFollowUps((prev) =>
          prev.map((item) =>
            item._id === enquiryId ? { ...item, followUpStatus: newStatus } : item
          )
        );
      } else {
        alert(res.message || 'Failed to update follow-up status.');
      }
    } catch (err) {
      console.error('Failed to update follow-up status:', err);
      alert('Error updating status.');
    }
  };

  const openRescheduleModal = (item) => {
    setSelectedFollowUp(item);
    setRescheduleDate(item.followUpDate || '');
    setRescheduleTime(item.followUpTime || '11:00 AM');
    setRescheduleNotes(item.followUpNotes || '');
    setRescheduleStatus(item.followUpStatus || 'Pending');
    setRescheduleRepId(item.assignedTo?._id || item.assignedTo || '');
    setRescheduleSuccess('');
  };

  const handleSaveReschedule = async (e) => {
    e.preventDefault();
    if (!selectedFollowUp) return;

    setSavingReschedule(true);
    setRescheduleSuccess('');

    try {
      const assignedRepObj = adminUsers.find((u) => u._id === rescheduleRepId);
      const payload = {
        followUpDate: rescheduleDate,
        followUpTime: rescheduleTime,
        followUpNotes: rescheduleNotes,
        followUpStatus: rescheduleStatus,
        assignedTo: rescheduleRepId || null,
        assignedToName: assignedRepObj ? assignedRepObj.name || assignedRepObj.username : '',
      };

      const res = await api.updateEnquiry(selectedFollowUp._id, payload);
      if (res.success) {
        setRescheduleSuccess('Follow-up schedule and rep updated successfully!');
        setFollowUps((prev) =>
          prev.map((item) =>
            item._id === selectedFollowUp._id ? { ...item, ...payload } : item
          )
        );
        setTimeout(() => {
          setSelectedFollowUp(null);
        }, 1000);
      } else {
        alert(res.message || 'Failed to update follow-up schedule.');
      }
    } catch (err) {
      alert('Network error updating follow-up.');
    } finally {
      setSavingReschedule(false);
    }
  };

  const handleCallLogAdded = (enquiryId, updatedLogs) => {
    setFollowUps((prev) =>
      prev.map((item) =>
        item._id === enquiryId ? { ...item, callLogs: updatedLogs } : item
      )
    );
    if (callLogEnquiry && callLogEnquiry._id === enquiryId) {
      setCallLogEnquiry((prev) => ({ ...prev, callLogs: updatedLogs }));
    }
    if (selectedFollowUp && selectedFollowUp._id === enquiryId) {
      setSelectedFollowUp((prev) => ({ ...prev, callLogs: updatedLogs }));
    }
  };

  const handleEnquiryUpdatedFromCallLog = (enquiryId, updatedData) => {
    setFollowUps((prev) =>
      prev.map((item) =>
        item._id === enquiryId ? { ...item, ...updatedData } : item
      )
    );
  };

  const getFollowUpStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Overdue':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Pending':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-[#ECE7E1] shadow-luxury space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg relative">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by client name, phone, property or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold bg-surface-warm/30"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-primary hover:bg-black text-white text-xs font-semibold transition-colors shadow-xs"
            >
              Filter
            </button>
          </form>

          {/* Quick Header Summary */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-charcoal-500">
              Total Scheduled Follow-ups:{' '}
              <strong className="text-primary font-bold">{totalCount}</strong>
            </span>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-xs">
          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-surface-warm/40 px-3 py-2 rounded-xl border border-gray-200/70">
            <Calendar className="w-4 h-4 text-gold shrink-0" />
            <span className="text-charcoal-500 font-medium shrink-0">Date:</span>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="w-full bg-transparent font-semibold text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-surface-warm/40 px-3 py-2 rounded-xl border border-gray-200/70">
            <Filter className="w-4 h-4 text-gold shrink-0" />
            <span className="text-charcoal-500 font-medium shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent font-semibold text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sales Rep Filter */}
          <div className="flex items-center gap-2 bg-surface-warm/40 px-3 py-2 rounded-xl border border-gray-200/70">
            <UserCheck className="w-4 h-4 text-gold shrink-0" />
            <span className="text-charcoal-500 font-medium shrink-0">Sales Rep:</span>
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="w-full bg-transparent font-semibold text-primary focus:outline-none cursor-pointer truncate"
            >
              <option value="all">All Sales Reps</option>
              {adminUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name || `@${u.username}`} {u.role === 'Sales Rep' ? '★' : `(${u.role})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Range Row */}
        {datePreset === 'custom' && (
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-charcoal-500 font-medium">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-charcoal-500 font-medium">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none text-xs"
              />
            </div>
            <button
              onClick={() => fetchFollowUps(1)}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-black transition-colors"
            >
              Apply Range
            </button>
          </div>
        )}
      </div>

      {/* Follow-ups Table Container */}
      <div className="bg-white rounded-2xl border border-[#ECE7E1] shadow-luxury overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-gold" />
            <h3 className="font-bold text-primary text-sm sm:text-base">
              Scheduled Client Follow-ups ({totalCount})
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-charcoal-500">
            <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium">Loading follow-ups schedule...</span>
          </div>
        ) : followUps.length === 0 ? (
          <div className="py-20 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto">
              <CalendarClock className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-primary">No Scheduled Follow-ups Found</h4>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
              No follow-ups match your selected date or rep filter. To schedule a follow-up, open any lead's Call History or Dossier.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-warm/60 border-b border-gray-100 text-charcoal-500 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3.5 px-4">Follow-Up Date & Time</th>
                  <th className="py-3.5 px-4">Client Details</th>
                  <th className="py-3.5 px-4">Property / Subject</th>
                  <th className="py-3.5 px-4">Assigned Sales Rep</th>
                  <th className="py-3.5 px-4">Follow-Up Status</th>
                  <th className="py-3.5 px-4">Notes / Agenda</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {followUps.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => openRescheduleModal(item)}
                    className="hover:bg-surface-warm/40 transition-colors cursor-pointer"
                  >
                    {/* Follow-up Date & Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="text-primary block font-bold text-xs">
                            {item.followUpDate}
                          </strong>
                          <span className="text-[11px] text-charcoal-500">
                            {item.followUpTime || '11:00 AM'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Client Details */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <strong className="text-primary block font-bold text-xs">
                        {item.name}
                      </strong>
                      <div className="flex items-center gap-2 text-[11px] text-charcoal-500 mt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-gold" />
                          +91 {item.phone}
                        </span>
                        {item.email && (
                          <span className="flex items-center gap-1 truncate max-w-[150px]">
                            <Mail className="w-3 h-3 text-gold" />
                            {item.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Property */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-semibold text-primary block truncate">
                        {item.propertyTitle || 'General Advisory Enquiry'}
                      </span>
                      <span className="text-[10px] text-charcoal-500 uppercase tracking-wider block">
                        Lead Status: {item.status || 'New'}
                      </span>
                    </td>

                    {/* Assigned Sales Rep */}
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span className="font-bold text-primary">
                          {item.assignedToName || 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    {/* Follow-Up Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={item.followUpStatus || 'Pending'}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${getFollowUpStatusBadge(
                          item.followUpStatus || 'Pending'
                        )}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Notes / Agenda */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-xs text-charcoal-600 line-clamp-2">
                        {item.followUpNotes || item.message || (
                          <span className="text-charcoal-400 italic">No notes</span>
                        )}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Call Log Modal Button */}
                        <button
                          onClick={() => setCallLogEnquiry(item)}
                          className={`p-1.5 rounded-lg border transition-all relative ${
                            item.callLogs && item.callLogs.length > 0
                              ? 'bg-gold/10 border-gold/40 text-gold hover:bg-gold/20'
                              : 'border-gray-200 text-charcoal-600 hover:text-gold hover:border-gold'
                          }`}
                          title={`Call History & Logs (${item.callLogs?.length || 0})`}
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          {item.callLogs && item.callLogs.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-gold text-white text-[9px] font-bold rounded-full min-w-3.5 text-center leading-tight shadow-xs">
                              {item.callLogs.length}
                            </span>
                          )}
                        </button>

                        {/* View / Reschedule Button */}
                        <button
                          onClick={() => openRescheduleModal(item)}
                          className="p-1.5 rounded-lg border border-gray-200 text-charcoal-600 hover:text-primary hover:bg-gray-100 transition-colors"
                          title="Reschedule / Manage Follow-up"
                        >
                          <Eye className="w-3.5 h-3.5" />
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
            Showing <strong className="text-primary font-bold">{followUps.length > 0 ? (currentPage - 1) * 20 + 1 : 0}</strong> to{' '}
            <strong className="text-primary font-bold">{Math.min(currentPage * 20, totalCount)}</strong> of{' '}
            <strong className="text-primary font-bold">{totalCount}</strong> follow-ups
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchFollowUps(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-surface-warm disabled:opacity-40 disabled:hover:bg-white text-xs font-semibold text-primary transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <span className="px-3 py-1.5 rounded-lg bg-surface-warm font-bold text-xs text-primary">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => fetchFollowUps(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-surface-warm disabled:opacity-40 disabled:hover:bg-white text-xs font-semibold text-primary transition-colors flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reschedule & Manage Follow-up Modal */}
      {selectedFollowUp && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedFollowUp(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#181818] px-6 py-5 text-white flex items-center justify-between border-b border-[#2A2A2A]">
              <div>
                <span className="text-gold text-[10px] font-bold uppercase tracking-wider block">
                  Follow-up Management
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {selectedFollowUp.name}
                </h3>
                <p className="text-xs text-charcoal-400">
                  {selectedFollowUp.propertyTitle || 'General Advisory Enquiry'}
                </p>
              </div>
              <button
                onClick={() => setSelectedFollowUp(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveReschedule} className="p-6 space-y-4 text-xs">
              {rescheduleSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{rescheduleSuccess}</span>
                </div>
              )}

              {/* Follow-up Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Follow-up Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-primary bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Time Slot (AM/PM) *
                  </label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-primary bg-white focus:outline-none focus:border-blue-600"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assigned Sales Rep & Follow-up Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Assigned Sales Rep
                  </label>
                  <select
                    value={rescheduleRepId}
                    onChange={(e) => setRescheduleRepId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-primary bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="">Unassigned</option>
                    {adminUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name || `@${u.username}`} {u.role === 'Sales Rep' ? '★' : `(${u.role})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Follow-up Status
                  </label>
                  <select
                    value={rescheduleStatus}
                    onChange={(e) => setRescheduleStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-primary bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Follow-up Notes / Agenda */}
              <div>
                <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  Follow-up Notes & Discussion Agenda
                </label>
                <textarea
                  rows={3}
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  placeholder="Record discussion agenda, paperwork verification, quote review..."
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary resize-none"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedFollowUp;
                    setSelectedFollowUp(null);
                    setCallLogEnquiry(target);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold/40 bg-gold/10 hover:bg-gold/20 text-gold text-xs font-bold transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Open Call Log History</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFollowUp(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-charcoal-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingReschedule}
                    className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {savingReschedule ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Follow-up</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Call History & Logs Modal (Same Modal Shared across Desk) */}
      <CallLogModal
        enquiry={callLogEnquiry}
        isOpen={!!callLogEnquiry}
        onClose={() => setCallLogEnquiry(null)}
        onLogAdded={handleCallLogAdded}
        onEnquiryUpdated={handleEnquiryUpdatedFromCallLog}
        currentUser={currentUser}
      />
    </div>
  );
};
