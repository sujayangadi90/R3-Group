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
  FileText,
  DollarSign,
  X,
  Save,
  Download,
  AlertCircle,
  RotateCcw,
  UserCheck,
  Flame,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Maximize2,
  Bed,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AdminSellRequests = () => {
  const { user: currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [temperatureFilter, setTemperatureFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state (20 records per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Date Filter State - defaults to 'thisMonth'
  const [datePreset, setDatePreset] = useState('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Selected sell request for inspection drawer
  const [selectedRequest, setSelectedRequest] = useState(null);
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
    return { startDate: '', endDate: '' };
  };

  // Fetch admin users for lead assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRes = await api.getUsers();
        if (usersRes.success && usersRes.data) {
          setAdminUsers(usersRes.data);
        }
      } catch (err) {
        console.error('Failed to load admin users:', err);
      }
    };
    fetchUsers();
  }, []);

  const fetchSellRequests = async (page = currentPage) => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const res = await api.getEnquiries({
        type: 'sell_property', // Strictly filter for sell property submissions
        status: statusFilter,
        temperature: temperatureFilter,
        search: searchTerm,
        startDate,
        endDate,
        assignedTo: assignedFilter,
        page,
        limit: 20,
      });

      if (res.success && res.data) {
        setRequests(res.data);
        if (res.totalPages !== undefined) setTotalPages(res.totalPages || 1);
        if (res.total !== undefined) setTotalCount(res.total || res.data.length);
      }
    } catch (err) {
      console.error('Failed to fetch sell property requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchSellRequests(1);
  }, [statusFilter, temperatureFilter, assignedFilter, datePreset, customStartDate, customEndDate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchSellRequests(newPage);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSellRequests(1);
  };

  const handleAssignSales = async (id, assignedUserId) => {
    const assignedUser = adminUsers.find((u) => u._id === assignedUserId);
    const assignedName = assignedUser ? (assignedUser.name || `@${assignedUser.username}`) : '';
    setUpdatingId(id);
    try {
      const res = await api.updateEnquiry(id, {
        assignedTo: assignedUserId || null,
        assignedToName: assignedName,
      });
      if (res.success) {
        setRequests((prev) =>
          prev.map((item) =>
            item._id === id
              ? { ...item, assignedTo: assignedUserId || null, assignedToName: assignedName }
              : item
          )
        );
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest({
            ...selectedRequest,
            assignedTo: assignedUserId || null,
            assignedToName: assignedName,
          });
        }
      }
    } catch (err) {
      alert('Failed to reassign request.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await api.updateEnquiry(id, { status: newStatus });
      if (res.success) {
        setRequests((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest({ ...selectedRequest, status: newStatus });
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
        setRequests((prev) =>
          prev.map((item) => (item._id === id ? { ...item, temperature: newTemp } : item))
        );
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest({ ...selectedRequest, temperature: newTemp });
        }
      }
    } catch (err) {
      console.error('Failed to update temperature:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) return;
    try {
      const res = await api.updateEnquiry(selectedRequest._id, { adminNotes: editingNotes });
      if (res.success) {
        setSelectedRequest({ ...selectedRequest, adminNotes: editingNotes });
        setRequests((prev) =>
          prev.map((item) =>
            item._id === selectedRequest._id ? { ...item, adminNotes: editingNotes } : item
          )
        );
        alert('Internal notes updated successfully.');
      }
    } catch (err) {
      alert('Failed to save internal notes.');
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this sell property request?')) return;
    try {
      const res = await api.deleteEnquiry(id);
      if (res.success) {
        setRequests((prev) => prev.filter((item) => item._id !== id));
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest(null);
        }
      }
    } catch (err) {
      alert('Failed to delete sell request.');
    }
  };

  const openDrawer = (item) => {
    setSelectedRequest(item);
    setEditingNotes(item.adminNotes || '');
  };

  const isSuperAdmin =
    currentUser?.role === 'Super Admin' ||
    currentUser?.isPrimaryAdmin === true ||
    currentUser?.username?.toLowerCase() === 'admin';

  const exportCSV = () => {
    if (!isSuperAdmin) {
      alert('Access restricted: Only Super Admins can export sell mandates.');
      return;
    }
    if (requests.length === 0) return;
    const headers = [
      'Submission Date',
      'Owner / Rep Name',
      'Phone',
      'Email',
      'Property Title / Building',
      'Property Type',
      'Location',
      'Carpet Area',
      'Bedrooms',
      'Expected Price',
      'Status',
      'Assigned Rep',
      'Special Features & Notes',
    ];

    const rows = requests.map((e) => [
      new Date(e.createdAt).toLocaleDateString(),
      `"${e.name}"`,
      `"${e.phone}"`,
      `"${e.email}"`,
      `"${e.sellDetails?.propertyTitle || e.propertyTitle || ''}"`,
      `"${e.sellDetails?.propertyType || ''}"`,
      `"${e.sellDetails?.location || ''}"`,
      `"${e.sellDetails?.carpetArea || ''}"`,
      `"${e.sellDetails?.bedrooms || ''}"`,
      `"${e.sellDetails?.expectedPrice || ''}"`,
      e.status,
      `"${e.assignedToName || 'Unassigned'}"`,
      `"${(e.sellDetails?.additionalNotes || e.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `R3_Group_Sell_Property_Requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Discussion':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Site Visit':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Negotiation':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Lost':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTemperatureBadge = (temp) => {
    switch (temp) {
      case 'Hot':
        return { pill: 'bg-red-50 text-red-600 border-red-200 font-bold', icon: '🔥 Hot' };
      case 'Warm':
        return { pill: 'bg-amber-50 text-amber-600 border-amber-200 font-semibold', icon: '⚡ Warm' };
      case 'Cold':
        return { pill: 'bg-sky-50 text-sky-600 border-sky-200 font-normal', icon: '❄️ Cold' };
      default:
        return { pill: 'bg-gray-50 text-gray-500 border-gray-200', icon: '—' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#ECECE8] shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by owner name, phone, building, location, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
            >
              Filter
            </button>
          </form>

          {/* Export Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={requests.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-surface-warm text-xs font-bold text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-gold" />
              <span>Export CSV Dossier</span>
            </button>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-surface-warm px-3 py-1.5 rounded-xl border border-gray-200">
            <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="text-xs font-semibold text-charcoal-700">Date:</span>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
            >
              <option value="thisMonth">This Month (Default)</option>
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="custom">Custom Range...</option>
            </select>
          </div>

          {/* Custom Date Pickers */}
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

          {/* Lead Temp */}
          <div className="flex items-center gap-1.5 bg-surface-warm px-3 py-1.5 rounded-xl border border-gray-200">
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

          {/* Assigned Rep */}
          <div className="flex items-center gap-1.5 bg-surface-warm px-3 py-1.5 rounded-xl border border-gray-200">
            <span className="text-xs font-semibold text-charcoal-700">Assigned Rep:</span>
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Sales Reps</option>
              {adminUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name || `@${u.username}`}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(statusFilter !== 'all' ||
            temperatureFilter !== 'all' ||
            assignedFilter !== 'all' ||
            datePreset !== 'thisMonth' ||
            searchTerm !== '') && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setTemperatureFilter('all');
                setAssignedFilter('all');
                setDatePreset('thisMonth');
                setCustomStartDate('');
                setCustomEndDate('');
                setSearchTerm('');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Sell Requests Table Card */}
      <div className="bg-white rounded-2xl border border-[#ECECE8] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-surface-warm/30">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-primary text-sm">
              Sell Property Requests ({totalCount})
            </h3>
            <span className="text-xs text-charcoal-500">
              Filtered by Date ({datePreset})
            </span>
          </div>
          <span className="text-xs text-charcoal-500 hidden sm:inline">
            Click row to view full asset specification dossier
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-charcoal-500 text-sm">
            Loading sell property requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Building2 className="w-10 h-10 text-gold mx-auto opacity-50" />
            <h4 className="font-bold text-primary text-sm">No Sell Property Requests Found</h4>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
              No owner divestment submissions match the selected date or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-warm border-b border-gray-100 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Owner / Contact</th>
                  <th className="py-3 px-4">Asset Details</th>
                  <th className="py-3 px-4">Area & Config</th>
                  <th className="py-3 px-4">Expected Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Intent</th>
                  <th className="py-3 px-4">Assigned Rep</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {requests.map((item) => {
                  const details = item.sellDetails || {};
                  return (
                    <tr
                      key={item._id}
                      onClick={() => openDrawer(item)}
                      className="hover:bg-surface/60 transition-colors cursor-pointer"
                    >
                      {/* Date */}
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

                      {/* Owner Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-primary">{item.name}</div>
                        <div className="text-[11px] text-charcoal-500">{item.phone}</div>
                        <div className="text-[11px] text-charcoal-500 truncate max-w-[170px]">
                          {item.email}
                        </div>
                      </td>

                      {/* Property Details */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-primary block truncate max-w-[200px]">
                          {details.propertyTitle || item.propertyTitle || 'Asset Sale'}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-charcoal-500">
                          <span className="px-1.5 py-0.2 rounded bg-gold-subtle text-gold font-bold text-[10px]">
                            {details.propertyType || 'Residential'}
                          </span>
                          <span className="truncate max-w-[140px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gold shrink-0" />
                            {details.location || 'Mumbai'}
                          </span>
                        </div>
                      </td>

                      {/* Area & Config */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-primary">
                          {details.carpetArea || '—'}
                        </div>
                        <div className="text-[11px] text-charcoal-500">
                          {details.bedrooms || '—'}
                        </div>
                      </td>

                      {/* Expected Target Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-gold text-sm block">
                          {details.expectedPrice || 'On Request'}
                        </span>
                      </td>

                      {/* Status */}
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

                      {/* Intent */}
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

                      {/* Assigned Rep */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={item.assignedTo || ''}
                          onChange={(e) => handleAssignSales(item._id, e.target.value)}
                          disabled={updatingId === item._id}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-primary focus:outline-none cursor-pointer max-w-[140px] truncate"
                        >
                          <option value="">Unassigned</option>
                          {adminUsers.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name || `@${u.username}`}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDrawer(item)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-white text-charcoal-600 hover:text-primary transition-colors cursor-pointer"
                            title="Inspect Particulars"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(item._id)}
                            className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                            title="Delete Request"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-surface-warm/30">
          <div className="text-charcoal-500">
            Showing <strong className="text-primary">{requests.length}</strong> of{' '}
            <strong className="text-primary">{totalCount}</strong> sell property requests
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-primary cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-primary">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-primary cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 bg-primary text-white flex items-center justify-between sticky top-0 z-10 border-b border-primary/50">
              <div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest block">
                  Confidential Sell Property Mandate
                </span>
                <h3 className="text-lg font-bold mt-0.5">
                  {selectedRequest.sellDetails?.propertyTitle || selectedRequest.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Status and Intent Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-warm border border-gray-200">
                <div>
                  <span className="text-[11px] font-bold text-charcoal-500 uppercase block mb-1">
                    Status
                  </span>
                  <select
                    value={selectedRequest.status}
                    onChange={(e) => handleStatusChange(selectedRequest._id, e.target.value)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                      selectedRequest.status
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
                    Intent
                  </span>
                  <select
                    value={selectedRequest.temperature || 'Warm'}
                    onChange={(e) => handleTemperatureChange(selectedRequest._id, e.target.value)}
                    className={`text-xs px-2.5 py-1 rounded-full border ${
                      getTemperatureBadge(selectedRequest.temperature || 'Warm').pill
                    }`}
                  >
                    <option value="Hot">🔥 Hot</option>
                    <option value="Warm">⚡ Warm</option>
                    <option value="Cold">❄️ Cold</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-charcoal-500 uppercase block mb-1">
                    Assigned Rep
                  </span>
                  <select
                    value={selectedRequest.assignedTo || ''}
                    onChange={(e) => handleAssignSales(selectedRequest._id, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-300 bg-white text-primary focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {adminUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name || `@${u.username}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Owner / Representative Credentials */}
              <div className="p-4 rounded-xl bg-surface border border-gray-100 space-y-3">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-gray-200 pb-2">
                  1. Owner / Representative Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-charcoal-400 block text-[11px]">Full Name:</span>
                    <strong className="text-primary text-sm">{selectedRequest.name}</strong>
                  </div>

                  <div>
                    <span className="text-charcoal-400 block text-[11px]">Direct Mobile:</span>
                    <a
                      href={`tel:${selectedRequest.phone}`}
                      className="text-primary font-bold hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-gold" />
                      {selectedRequest.phone}
                    </a>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-charcoal-400 block text-[11px]">Email Address:</span>
                    <a
                      href={`mailto:${selectedRequest.email}`}
                      className="text-primary font-semibold hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-gold" />
                      {selectedRequest.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Property Particulars */}
              <div className="p-4 rounded-xl bg-surface border border-gray-100 space-y-3">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-gray-200 pb-2">
                  2. Property Particulars
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-charcoal-400 block text-[11px]">Property Name / Building:</span>
                    <strong className="text-primary text-sm">
                      {selectedRequest.sellDetails?.propertyTitle || '—'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-charcoal-400 block text-[11px]">Property Type:</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-gold-subtle text-gold font-bold text-xs">
                      {selectedRequest.sellDetails?.propertyType || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-charcoal-400 block text-[11px]">Location / Neighborhood:</span>
                    <strong className="text-primary">
                      {selectedRequest.sellDetails?.location || '—'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-charcoal-400 block text-[11px]">Carpet Area:</span>
                    <strong className="text-primary">
                      {selectedRequest.sellDetails?.carpetArea || '—'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-charcoal-400 block text-[11px]">Bedrooms / Configuration:</span>
                    <strong className="text-primary">
                      {selectedRequest.sellDetails?.bedrooms || '—'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-charcoal-400 block text-[11px]">Expected Target Price:</span>
                    <strong className="text-gold text-base font-extrabold block">
                      {selectedRequest.sellDetails?.expectedPrice || '—'}
                    </strong>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-charcoal-400 block text-[11px] mb-1">
                      Special Features, Finishes & Title Remarks:
                    </span>
                    <div className="p-3 rounded-lg bg-surface-warm border border-gray-200 text-charcoal-700 leading-relaxed whitespace-pre-line">
                      {selectedRequest.sellDetails?.additionalNotes || selectedRequest.message || 'None provided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-primary uppercase tracking-wider">
                  Managing Partner Notes & Appraisal Comments
                </label>
                <textarea
                  rows={4}
                  placeholder="Record confidential property valuation notes, seller mandate terms, title verification..."
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary resize-none"
                ></textarea>
                <button
                  onClick={handleSaveNotes}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-black text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-gold" />
                  <span>Save Notes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
