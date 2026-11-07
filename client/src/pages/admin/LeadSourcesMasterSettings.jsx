import React, { useState, useEffect } from 'react';
import {
  Share2,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Tag,
  Search,
} from 'lucide-react';
import { api } from '../../services/api';

export const LeadSourcesMasterSettings = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [sourceName, setSourceName] = useState('');
  const [sourceCategory, setSourceCategory] = useState('Digital');
  const [formLoading, setFormLoading] = useState(false);

  const fetchLeadSources = async () => {
    setLoading(true);
    try {
      const res = await api.getLeadSources(true);
      if (res.success && res.data) {
        setSources(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch lead sources:', err);
      setErrorMsg('Failed to fetch lead sources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadSources();
  }, []);

  const openAddModal = () => {
    setEditingSource(null);
    setSourceName('');
    setSourceCategory('Digital');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (src) => {
    setEditingSource(src);
    setSourceName(src.name);
    setSourceCategory(src.category || 'General');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveSource = async (e) => {
    e.preventDefault();
    if (!sourceName.trim()) {
      setErrorMsg('Lead source name is required.');
      return;
    }

    setFormLoading(true);
    setErrorMsg('');
    try {
      if (editingSource) {
        const res = await api.updateLeadSource(editingSource._id, {
          name: sourceName.trim(),
          category: sourceCategory,
        });
        if (res.success) {
          setSuccessMsg(`Lead source "${sourceName.trim()}" updated successfully.`);
          setIsModalOpen(false);
          fetchLeadSources();
        } else {
          setErrorMsg(res.message || 'Failed to update lead source.');
        }
      } else {
        const res = await api.createLeadSource({
          name: sourceName.trim(),
          category: sourceCategory,
          sortOrder: sources.length,
        });
        if (res.success) {
          setSuccessMsg(`Lead source "${sourceName.trim()}" created successfully.`);
          setIsModalOpen(false);
          fetchLeadSources();
        } else {
          setErrorMsg(res.message || 'Failed to create lead source.');
        }
      }
    } catch (err) {
      setErrorMsg('Network error saving lead source.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSource = async (src) => {
    if (!window.confirm(`Are you sure you want to delete lead source "${src.name}"?`)) return;

    try {
      const res = await api.deleteLeadSource(src._id);
      if (res.success) {
        setSuccessMsg(`Lead source "${src.name}" deleted.`);
        setSources((prev) => prev.filter((s) => s._id !== src._id));
      } else {
        alert(res.message || 'Failed to delete lead source.');
      }
    } catch (err) {
      alert('Network error deleting lead source.');
    }
  };

  const filteredSources = sources.filter((s) =>
    s.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-600 hover:text-red-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Block & Action Toolbar */}
      <div className="bg-white p-6 rounded-2xl border border-[#ECECE8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-gold" />
            <h2 className="text-base font-bold text-primary">Lead Sources Master Settings</h2>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Manage channel attribution and marketing origins captured when recording offline and incoming client enquiries.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lead Source</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#ECECE8] shadow-sm overflow-hidden">
        {/* Search & Counter Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-warm/30">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-primary text-sm">
              Configured Sources ({sources.length})
            </h3>
            <span className="text-xs text-charcoal-500">
              Active in offline enquiry modal & CRM dossiers
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lead sources..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-primary bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-charcoal-500 text-sm">
            Loading lead sources...
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="p-12 text-center text-charcoal-500 text-sm">
            {searchFilter ? 'No lead sources match your search.' : 'No lead sources configured.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-warm border-b border-gray-100 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Lead Source Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredSources.map((src, index) => (
                  <tr key={src._id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-charcoal-400 text-[11px]">
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gold-subtle text-gold flex items-center justify-center shrink-0 border border-gold/30">
                          <Tag className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-primary text-sm">
                          {src.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-charcoal-700">
                        {src.category || 'General'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(src)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-white text-charcoal-600 hover:text-primary transition-colors cursor-pointer"
                          title="Edit Lead Source"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSource(src)}
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                          title="Delete Lead Source"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-gold" />
                <h3 className="font-bold text-sm">
                  {editingSource ? `Edit Lead Source` : 'Add Master Lead Source'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSource} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Lead Source Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google Search, Walk-in, Referral"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Channel Classification
                </label>
                <select
                  value={sourceCategory}
                  onChange={(e) => setSourceCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-primary cursor-pointer font-medium"
                >
                  <option value="Digital">Digital / Online Advertising</option>
                  <option value="Direct">Direct / Telephony / Walk-in</option>
                  <option value="Network">Partner / Referral / Broker</option>
                  <option value="Print & Outdoor">Print, Hoardings & Outdoor</option>
                  <option value="Events">Events & Exhibitions</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-charcoal-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-xs shadow-md transition-all disabled:opacity-75 cursor-pointer"
                >
                  {formLoading ? 'Saving...' : editingSource ? 'Update Source' : 'Create Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
