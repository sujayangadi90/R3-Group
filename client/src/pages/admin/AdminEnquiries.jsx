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
  UserPlus,
  Flame,
  Thermometer,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AdminEnquiries = () => {
  const { user: currentUser } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [temperatureFilter, setTemperatureFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Date Filter State
  const [datePreset, setDatePreset] = useState('all'); // 'all', 'today', 'yesterday', '7days', 'thisMonth', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Selected enquiry for inspection drawer
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Compute start & end dates based on preset
  const getDateRange = () => {
    const now = new Date();
    if (datePreset === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      return { startDate: start, endDate: '' };
    }
    if (datePreset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const start = new Date(y.getFullYear(), y.getMonth(), y.getDate()).toISOString();
      const end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999).toISOString();
      return { startDate: start, endDate: end };
    }
    if (datePreset === '7days') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      return { startDate: start, endDate: '' };
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
    return { startDate: '', endDate: '' };
  };

  // Fetch users for assignment dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.getUsers();
        if (res.success && res.data) {
          setAdminUsers(res.data);
        }
      } catch (err) {
        console.error('Failed to load users for sales assignment:', err);
      }
    };
    fetchUsers();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const res = await api.getEnquiries({
        type: typeFilter,
        status: statusFilter,
        temperature: temperatureFilter,
        search: searchTerm,
        startDate,
        endDate,
        assignedTo: assignedFilter,
      });
      if (res.success && res.data) {
        setEnquiries(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [typeFilter, statusFilter, temperatureFilter, assignedFilter, datePreset, customStartDate, customEndDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEnquiries();
  };

  const handleResetDate = () => {
    setDatePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const handleAssignSales = async (enquiryId, userId) => {
    const selectedUser = adminUsers.find((u) => u._id === userId);
    const assignedToName = selectedUser ? (selectedUser.name || `@${selectedUser.username}`) : '';
    setUpdatingId(enquiryId);
    try {
      const res = await api.updateEnquiry(enquiryId, {
        assignedTo: userId || null,
        assignedToName,
      });
      if (res.success) {
        setEnquiries((prev) =>
          prev.map((item) =>
            item._id === enquiryId
              ? { ...item, assignedTo: userId || null, assignedToName }
              : item
          )
        );
        if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
          setSelectedEnquiry({
            ...selectedEnquiry,
            assignedTo: userId || null,
            assignedToName,
          });
        }
      }
    } catch (err) {
      alert('Failed to reassign lead.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await api.updateEnquiry(id, { status: newStatus });
      if (res.success) {
        setEnquiries((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedEnquiry && selectedEnquiry._id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTemperatureChange = async (id, newTemp) => {
    setUpdatingId(id);
    try {
      const res = await api.updateEnquiry(id, { temperature: newTemp });
      if (res.success) {
        setEnquiries((prev) =>
          prev.map((item) => (item._id === id ? { ...item, temperature: newTemp } : item))
        );
        if (selectedEnquiry && selectedEnquiry._id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, temperature: newTemp });
        }
      }
    } catch (err) {
      console.error('Failed to update temperature:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    try {
      const res = await api.updateEnquiry(selectedEnquiry._id, { adminNotes: editingNotes });
      if (res.success) {
        setSelectedEnquiry({ ...selectedEnquiry, adminNotes: editingNotes });
        setEnquiries((prev) =>
          prev.map((item) =>
            item._id === selectedEnquiry._id ? { ...item, adminNotes: editingNotes } : item
          )
        );
        alert('Internal notes updated successfully.');
      }
    } catch (err) {
      alert('Failed to save notes.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this lead record?')) return;
    try {
      const res = await api.deleteEnquiry(id);
      if (res.success) {
        setEnquiries((prev) => prev.filter((item) => item._id !== id));
        if (selectedEnquiry && selectedEnquiry._id === id) {
          setSelectedEnquiry(null);
        }
      }
    } catch (err) {
      alert('Failed to delete lead record.');
    }
  };

  const openDrawer = (item) => {
    setSelectedEnquiry(item);
    setEditingNotes(item.adminNotes || '');
  };

  // Check if current user is Super Admin
  const isSuperAdmin =
    currentUser?.role === 'Super Admin' ||
    currentUser?.isPrimaryAdmin === true ||
    currentUser?.username?.toLowerCase() === 'admin';

  const exportCSV = () => {
    if (!isSuperAdmin) {
      alert('Access restricted: Only Super Admins can export lead and client dossiers.');
      return;
    }
    if (enquiries.length === 0) return;
    const headers = ['Type', 'Client Name', 'Phone', 'Email', 'Property / Subject', 'Status', 'Date Submitted'];
    const rows = enquiries.map((e) => [
      e.type,
      `"${e.name}"`,
      `"${e.phone}"`,
      `"${e.email}"`,
      `"${e.propertyTitle || e.subject || ''}"`,
      e.status,
      new Date(e.createdAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `R3_Group_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'site_visit':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
            Site Visit
          </span>
        );
      case 'sell_property':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
            Sell Mandate
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold uppercase tracking-wider">
            Contact
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Contacted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Discussion':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Site Visit':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Negotiation':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Closed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'Lost':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getTemperatureBadge = (temp) => {
    switch (temp) {
      case 'Hot':
        return {
          pill: 'bg-red-50 text-red-700 border-red-200 font-bold',
          icon: '🔥',
        };
      case 'Warm':
        return {
          pill: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
          icon: '⚡',
        };
      case 'Cold':
        return {
          pill: 'bg-cyan-50 text-cyan-700 border-cyan-200 font-medium',
          icon: '❄️',
        };
      default:
        return {
          pill: 'bg-gray-50 text-gray-600 border-gray-200',
          icon: '•',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#ECECE8] shadow-sm space-y-4">
        {/* Top Row: Search + Action Buttons */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client name, email, phone, or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-24 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
            >
              Filter
            </button>
          </form>

          {/* Quick Actions (Super Admin Only) */}
          {isSuperAdmin && (
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-charcoal-700 transition-colors shadow-sm"
                title="Export filtered records to CSV (Super Admin Only)"
              >
                <Download className="w-3.5 h-3.5 text-gold" />
                <span>Export CSV</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Pills Row: Date Filter + Type + Status */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
          {/* ========================================================= */}
          {/* DATE FILTER */}
          {/* ========================================================= */}
          <div className="flex items-center gap-1.5 bg-surface-warm px-3 py-1.5 rounded-xl border border-gray-200">
            <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="text-xs font-semibold text-charcoal-700">Date:</span>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="custom">Custom Range...</option>
            </select>
          </div>

          {/* Custom Date Pickers (visible if 'custom' is selected) */}
          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 bg-surface-warm px-3 py-1.5 rounded-xl border border-gold/40 animate-in fade-in duration-150">
              <span className="text-[11px] text-charcoal-500 font-semibold">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-white px-2 py-0.5 rounded border border-gray-300 text-xs text-primary focus:outline-none"
              />
              <span className="text-[11px] text-charcoal-500 font-semibold">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-white px-2 py-0.5 rounded border border-gray-300 text-xs text-primary focus:outline-none"
              />
            </div>
          )}

          {/* Reset Date Pill if active */}
          {datePreset !== 'all' && (
            <button
              onClick={handleResetDate}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors"
              title="Clear date filter"
            >
              <X className="w-3 h-3" />
              <span>Clear Date</span>
            </button>
          )}

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-surface-warm px-3 py-1.5 rounded-xl border border-gray-200">
            <span className="text-xs font-semibold text-charcoal-700">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Enquiries</option>
              <option value="site_visit">Site Visits</option>
              <option value="sell_property">Sell Mandates</option>
              <option value="contact">Contact Requests</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-surface-warm px-3 py-1.5 rounded-xl border border-gray-200">
            <span className="text-xs font-semibold text-charcoal-700">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="In Discussion">In Discussion</option>
              <option value="Site Visit">Site Visit</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed">Closed</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          {/* Temperature (Intent) Filter */}
          <div className="flex items-center gap-1.5 bg-surface-warm px-3 py-1.5 rounded-xl border border-gray-200">
            <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="text-xs font-semibold text-charcoal-700">Intent:</span>
            <select
              value={temperatureFilter}
              onChange={(e) => setTemperatureFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All (Cold/Warm/Hot)</option>
              <option value="Hot">🔥 Hot</option>
              <option value="Warm">⚡ Warm</option>
              <option value="Cold">❄️ Cold</option>
            </select>
          </div>

          {/* Assigned Sales Rep Filter */}
          <div className="flex items-center gap-1.5 bg-surface-warm px-3 py-1.5 rounded-xl border border-gray-200">
            <UserCheck className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="text-xs font-semibold text-charcoal-700">Assigned Rep:</span>
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Sales Reps</option>
              {adminUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name || `@${u.username}`} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Reset All Filters button */}
          {(typeFilter !== 'all' || statusFilter !== 'all' || temperatureFilter !== 'all' || assignedFilter !== 'all' || datePreset !== 'all' || searchTerm !== '') && (
            <button
              onClick={() => {
                setTypeFilter('all');
                setStatusFilter('all');
                setTemperatureFilter('all');
                setAssignedFilter('all');
                handleResetDate();
                setSearchTerm('');
              }}
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-charcoal-500 hover:text-primary transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-[#ECECE8] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-primary text-sm">
              Collected Leads & Mandates ({enquiries.length})
            </h3>
            {datePreset !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-gold-subtle text-gold text-[10px] font-bold">
                Filtered by Date ({datePreset})
              </span>
            )}
          </div>
          <span className="text-xs text-charcoal-500">Click row or "View Dossier" to inspect full details</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-charcoal-500 text-sm">Loading enquiries...</div>
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="font-bold text-primary">No enquiries matching filter.</p>
            <p className="text-xs text-charcoal-500">Try adjusting your date range, search query, or status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-warm border-b border-gray-100 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Client Details</th>
                  <th className="py-3 px-4">Property / Mandate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Intent (Lead Temp)</th>
                  <th className="py-3 px-4">Assigned Rep</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {enquiries.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-surface/60 transition-colors cursor-pointer"
                    onClick={() => openDrawer(item)}
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap text-charcoal-500">
                      <div className="font-semibold text-primary">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-charcoal-400">
                        {new Date(item.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getTypeBadge(item.type)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-primary">{item.name}</div>
                      <div className="text-[11px] text-charcoal-500">{item.phone}</div>
                      <div className="text-[11px] text-charcoal-500 truncate max-w-[180px]">
                        {item.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.type === 'sell_property' ? (
                        <div>
                          <span className="font-semibold text-primary block">
                            {item.sellDetails?.propertyTitle || 'Asset Sale'}
                          </span>
                          <span className="text-gold font-bold text-[11px]">
                            {item.sellDetails?.expectedPrice || 'Valuation Request'}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-semibold text-primary block">
                            {item.propertyTitle || item.subject || 'General Inquiry'}
                          </span>
                          {item.preferredDate && (
                            <span className="text-[11px] text-charcoal-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-gold" />
                              {item.preferredDate} ({item.preferredTime || 'Morning'})
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        disabled={updatingId === item._id}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Discussion">In Discussion</option>
                        <option value="Site Visit">Site Visit</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Closed">Closed</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={item.temperature || 'Warm'}
                        onChange={(e) => handleTemperatureChange(item._id, e.target.value)}
                        disabled={updatingId === item._id}
                        className={`text-xs px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${
                          getTemperatureBadge(item.temperature || 'Warm').pill
                        }`}
                      >
                        <option value="Hot">🔥 Hot</option>
                        <option value="Warm">⚡ Warm</option>
                        <option value="Cold">❄️ Cold</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={item.assignedTo || ''}
                        onChange={(e) => handleAssignSales(item._id, e.target.value)}
                        disabled={updatingId === item._id}
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          item.assignedTo
                            ? 'bg-blue-50 text-blue-800 border-blue-200 font-semibold'
                            : 'bg-gray-50 text-charcoal-400 border-gray-200'
                        }`}
                      >
                        <option value="">Unassigned</option>
                        {adminUsers.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name || `@${u.username}`} {u.role === 'Sales Rep' ? '★' : `(${u.role})`}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td
                      className="py-3.5 px-4 whitespace-nowrap text-right space-x-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => openDrawer(item)}
                        className="p-1.5 rounded-lg border border-gray-200 text-charcoal-600 hover:text-gold hover:border-gold transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Drawer / Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 bg-primary text-white flex items-center justify-between">
              <div>
                <span className="text-gold text-xs font-bold uppercase tracking-wider block">
                  Lead Dossier Record
                </span>
                <h3 className="text-lg font-bold mt-0.5">{selectedEnquiry.name}</h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Type and Status */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-[11px] font-bold text-charcoal-500 uppercase block mb-1">
                    Inquiry Type
                  </span>
                  {getTypeBadge(selectedEnquiry.type)}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-charcoal-500 uppercase block mb-1">
                    Lead Status
                  </span>
                  <select
                    value={selectedEnquiry.status}
                    onChange={(e) => handleStatusChange(selectedEnquiry._id, e.target.value)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusBadge(
                      selectedEnquiry.status
                    )}`}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Discussion">In Discussion</option>
                    <option value="Site Visit">Site Visit</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed">Closed</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-charcoal-500 uppercase block mb-1">
                    Intent (Temperature)
                  </span>
                  <select
                    value={selectedEnquiry.temperature || 'Warm'}
                    onChange={(e) => handleTemperatureChange(selectedEnquiry._id, e.target.value)}
                    className={`text-xs px-3 py-1 rounded-full border ${
                      getTemperatureBadge(selectedEnquiry.temperature || 'Warm').pill
                    }`}
                  >
                    <option value="Hot">🔥 Hot Intent</option>
                    <option value="Warm">⚡ Warm Intent</option>
                    <option value="Cold">❄️ Cold Intent</option>
                  </select>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-charcoal-500 uppercase block mb-1">
                    Assigned Sales Rep
                  </span>
                  <select
                    value={selectedEnquiry.assignedTo || ''}
                    onChange={(e) => handleAssignSales(selectedEnquiry._id, e.target.value)}
                    className="text-xs font-semibold px-3 py-1 rounded-lg border border-gray-300 bg-white text-primary focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {adminUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name || `@${u.username}`} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Contact Info */}
              <div className="p-4 rounded-xl bg-surface-warm border border-gray-200 space-y-2.5">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gold shrink-0" />
                    <a
                      href={`tel:${selectedEnquiry.phone}`}
                      className="text-primary font-semibold hover:underline"
                    >
                      {selectedEnquiry.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gold shrink-0" />
                    <a
                      href={`mailto:${selectedEnquiry.email}`}
                      className="text-primary font-semibold hover:underline truncate"
                    >
                      {selectedEnquiry.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Sell Property Particulars if applicable */}
              {selectedEnquiry.type === 'sell_property' && selectedEnquiry.sellDetails && (
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Asset Divestment Mandate Particulars
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-charcoal-500 uppercase block">Property Title</span>
                      <span className="font-bold text-primary">{selectedEnquiry.sellDetails.propertyTitle || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-charcoal-500 uppercase block">Category</span>
                      <span className="font-bold text-primary">{selectedEnquiry.sellDetails.propertyType}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-charcoal-500 uppercase block">Location</span>
                      <span className="font-bold text-primary">{selectedEnquiry.sellDetails.location}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-charcoal-500 uppercase block">Expected Price</span>
                      <span className="font-bold text-gold">{selectedEnquiry.sellDetails.expectedPrice}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-charcoal-500 uppercase block">Carpet Area</span>
                      <span className="font-bold text-primary">{selectedEnquiry.sellDetails.carpetArea}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-charcoal-500 uppercase block">Bedrooms</span>
                      <span className="font-bold text-primary">{selectedEnquiry.sellDetails.bedrooms} BHK</span>
                    </div>
                  </div>
                  {selectedEnquiry.sellDetails.additionalNotes && (
                    <div className="pt-2 border-t border-amber-200/60">
                      <span className="text-[11px] text-charcoal-500 uppercase block">Owner Notes</span>
                      <p className="text-xs text-charcoal-700 mt-0.5">{selectedEnquiry.sellDetails.additionalNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Site Visit Particulars */}
              {selectedEnquiry.type === 'site_visit' && (
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Site Visit Appointment
                  </h4>
                  <div className="text-xs space-y-1">
                    <p>
                      <strong>Target Property:</strong> {selectedEnquiry.propertyTitle || 'General Viewing'}
                    </p>
                    <p>
                      <strong>Preferred Date:</strong> {selectedEnquiry.preferredDate || 'Not specified'}
                    </p>
                    <p>
                      <strong>Preferred Time:</strong> {selectedEnquiry.preferredTime || 'Morning'}
                    </p>
                  </div>
                </div>
              )}

              {/* Client Message */}
              <div>
                <span className="text-[11px] font-bold text-charcoal-500 uppercase block mb-1">
                  Message / Special Request
                </span>
                <div className="p-3.5 rounded-xl bg-surface-warm border border-gray-200 text-xs text-charcoal-700 leading-relaxed whitespace-pre-line">
                  {selectedEnquiry.message || 'No additional message provided.'}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-charcoal-500 uppercase">
                    Internal Advisory Notes
                  </span>
                  <span className="text-[11px] text-charcoal-500">Visible only to admins</span>
                </div>
                <textarea
                  rows={4}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Record call logs, client net worth, architect visit notes, or next steps..."
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary resize-none"
                ></textarea>
                <button
                  onClick={handleSaveNotes}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-black transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-[11px] text-charcoal-500">
                Received: {new Date(selectedEnquiry.createdAt).toLocaleString()}
              </span>
              <button
                onClick={() => handleDelete(selectedEnquiry._id)}
                className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
