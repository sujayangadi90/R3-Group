import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Edit,
  Trash2,
  KeyRound,
  Check,
  X,
  Lock,
  Mail,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AdminSettings = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const initialForm = {
    name: '',
    username: '',
    password: '',
    email: '',
    role: 'Managing Partner',
    status: 'Active',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(initialForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      username: u.username || '',
      password: '',
      email: u.email || '',
      role: u.role || 'Managing Partner',
      status: u.status || 'Active',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openPasswordModal = (u) => {
    setPasswordModalUser(u);
    setNewPasswordInput('');
    setFormError('');
  };

  const handleCreateOrUpdateUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingUser) {
        // Update user
        const res = await api.updateUser(editingUser._id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          ...(formData.password ? { newPassword: formData.password } : {}),
        });

        if (res.success) {
          setIsModalOpen(false);
          setSuccessMsg(`User '${formData.username}' updated successfully.`);
          fetchUsers();
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          setFormError(res.message || 'Failed to update user.');
        }
      } else {
        // Create user
        const res = await api.createUser(formData);
        if (res.success) {
          setIsModalOpen(false);
          setSuccessMsg(`New administrator '${formData.username}' added successfully.`);
          fetchUsers();
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          setFormError(res.message || 'Failed to create user.');
        }
      }
    } catch (err) {
      setFormError('An error occurred. Check connection and fields.');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.trim().length < 4) {
      setFormError('Password must be at least 4 characters long.');
      return;
    }
    setFormLoading(true);
    setFormError('');

    try {
      const res = await api.updateUser(passwordModalUser._id, {
        newPassword: newPasswordInput.trim(),
      });
      if (res.success) {
        setPasswordModalUser(null);
        setSuccessMsg(`Password for '${passwordModalUser.username}' changed successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setFormError(res.message || 'Failed to reset password.');
      }
    } catch (err) {
      setFormError('An error occurred resetting password.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (u.isPrimaryAdmin) {
      alert('The primary system admin account cannot be deleted.');
      return;
    }

    if (!window.confirm(`Are you sure you want to revoke administrative access for user '${u.username}'?`)) {
      return;
    }

    try {
      const res = await api.deleteUser(u._id);
      if (res.success) {
        setUsers((prev) => prev.filter((item) => item._id !== u._id));
        setSuccessMsg(`User '${u.username}' was removed.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert(res.message || 'Failed to delete user.');
      }
    } catch (err) {
      alert('Error deleting user.');
    }
  };

  const handleToggleStatus = async (u) => {
    if (u.isPrimaryAdmin) {
      alert('The primary system admin account cannot be suspended.');
      return;
    }
    const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await api.updateUser(u._id, { status: newStatus });
      if (res.success) {
        setUsers((prev) =>
          prev.map((item) => (item._id === u._id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      alert('Failed to toggle status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Block & Action Toolbar */}
      <div className="bg-white p-6 rounded-2xl border border-[#ECECE8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gold" />
            <h2 className="text-base font-bold text-primary">Administrator User Management</h2>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Grant, manage, or revoke access credentials for managing the R3 Group real estate portal.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Admin User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#ECECE8] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-primary text-sm">
            Active Administrative Accounts ({users.length})
          </h3>
          <span className="text-xs text-charcoal-500">Authorized administrative operators</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-charcoal-500 text-sm">Loading administrators...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-warm border-b border-gray-100 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {users.map((u) => {
                  const isCurrent = currentUser?.username?.toLowerCase() === u.username.toLowerCase();
                  return (
                    <tr key={u._id} className="hover:bg-surface/50 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gold-subtle text-gold flex items-center justify-center font-bold text-sm shrink-0 border border-gold/30">
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-primary flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.isPrimaryAdmin && (
                                <span className="px-1.5 py-0.2 rounded bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-wider">
                                  Primary Root
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-[10px] text-emerald-600 font-semibold">(You)</span>
                              )}
                            </div>
                            <span className="text-[11px] text-charcoal-500 block">
                              {u.email || 'No email registered'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-primary font-semibold">
                        @{u.username}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            u.role === 'Super Admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : u.role === 'Managing Partner'
                              ? 'bg-gold-subtle text-gold border border-gold/40'
                              : 'bg-gray-100 text-charcoal-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={u.isPrimaryAdmin}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                            u.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                          } ${u.isPrimaryAdmin ? 'cursor-default' : 'cursor-pointer'}`}
                          title={u.isPrimaryAdmin ? 'Primary admin cannot be suspended' : 'Click to toggle status'}
                        >
                          {u.status}
                        </button>
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-charcoal-500 text-[11px]">
                        {u.lastLogin ? (
                          new Date(u.lastLogin).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                        <button
                          onClick={() => openPasswordModal(u)}
                          className="p-1.5 rounded-lg border border-gray-200 text-charcoal-600 hover:text-gold hover:border-gold transition-colors"
                          title="Change Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg border border-gray-200 text-charcoal-600 hover:text-primary transition-colors"
                          title="Edit User Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {u.isPrimaryAdmin ? (
                          <span
                            className="inline-block p-1.5 text-gray-300 cursor-not-allowed"
                            title="Root Admin cannot be deleted"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors"
                            title="Delete Admin Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Security Info Box */}
      <div className="p-5 rounded-2xl bg-white border border-[#ECECE8] shadow-sm flex items-start gap-4 text-xs text-charcoal-600">
        <ShieldCheck className="w-5 h-5 text-gold shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-primary text-xs uppercase tracking-wider">
            Administrative Role Privileges
          </h4>
          <p className="leading-relaxed">
            All registered administrators can manage incoming leads, site inspections, and property portfolios. Only <strong>Super Admins</strong> and <strong>Managing Partners</strong> should be granted access to user creation and credential reassignment.
          </p>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-8">
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gold" />
                <h3 className="font-bold text-base">
                  {editingUser ? `Edit Administrator: @${editingUser.username}` : 'Add New Administrator User'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateUser} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    placeholder="e.g. ramesh"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary ${
                      editingUser ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                  {editingUser && (
                    <span className="text-[10px] text-charcoal-500">Username cannot be altered</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@r3group.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Administrative Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Managing Partner">Managing Partner</option>
                    <option value="Advisory Partner">Advisory Partner</option>
                    <option value="Property Manager">Property Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    disabled={editingUser?.isPrimaryAdmin}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-primary ${
                      editingUser?.isPrimaryAdmin ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-charcoal-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-xs shadow-md transition-all disabled:opacity-75"
                >
                  {formLoading ? 'Saving...' : editingUser ? 'Save Changes' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-gold" />
                <h3 className="font-bold text-sm">
                  Reset Password: @{passwordModalUser.username}
                </h3>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordReset} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <p className="text-xs text-charcoal-600">
                Enter a new secure password for <strong>{passwordModalUser.name}</strong> (@{passwordModalUser.username}).
              </p>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-charcoal-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-black text-white font-bold text-xs shadow-md transition-all disabled:opacity-75"
                >
                  {formLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
