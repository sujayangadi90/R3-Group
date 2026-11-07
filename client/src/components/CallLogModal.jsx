import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  Clock,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  MessageSquare,
  History,
  PhoneForwarded,
  CalendarPlus,
  CalendarCheck,
} from 'lucide-react';
import { api } from '../services/api';

const CALL_STATUS_OPTIONS = [
  'Interested',
  'Not Interested',
  'Follow-Up Required',
  'Site Visit Requested',
  'Negotiation',
  'No Answer',
  'Busy',
  'Switched Off',
  'Not Reachable',
  'Wrong Number',
  'Call Back Later',
];

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

export const CallLogModal = ({
  enquiry,
  isOpen,
  onClose,
  onLogAdded,
  onEnquiryUpdated,
  currentUser,
}) => {
  // Call Log form state
  const [callMade, setCallMade] = useState('Yes');
  const [callStatus, setCallStatus] = useState('Interested');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Follow-up form state
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(enquiry?.followUpDate || '');
  const [followUpTime, setFollowUpTime] = useState(enquiry?.followUpTime || '11:00 AM');
  const [followUpNotes, setFollowUpNotes] = useState(enquiry?.followUpNotes || '');
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpSuccessMsg, setFollowUpSuccessMsg] = useState('');

  if (!isOpen || !enquiry) return null;

  const logs = Array.isArray(enquiry.callLogs) ? enquiry.callLogs : [];

  const handleSaveCallLog = async (e) => {
    e.preventDefault();
    if (!callStatus) {
      setErrorMsg('Please select a Call Status.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.addCallLog(enquiry._id, {
        callMade,
        callStatus,
        notes,
      });

      if (res.success) {
        if (onLogAdded) {
          onLogAdded(enquiry._id, res.data);
        }
        // Reset form
        setNotes('');
        setCallMade('Yes');
        setCallStatus('Interested');
        setShowAddForm(false);
      } else {
        setErrorMsg(res.message || 'Failed to save call log');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to save call log.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpDate) {
      setErrorMsg('Please select a follow-up date.');
      return;
    }

    setSavingFollowUp(true);
    setErrorMsg('');

    try {
      const payload = {
        followUpDate,
        followUpTime,
        followUpNotes,
        followUpStatus: 'Pending',
      };
      const res = await api.updateEnquiry(enquiry._id, payload);

      if (res.success) {
        setFollowUpSuccessMsg('Follow-up scheduled successfully!');
        if (onEnquiryUpdated) {
          onEnquiryUpdated(enquiry._id, res.data);
        }
        setTimeout(() => {
          setFollowUpSuccessMsg('');
          setShowFollowUpForm(false);
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Failed to schedule follow-up');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to schedule follow-up.');
    } finally {
      setSavingFollowUp(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Interested':
      case 'Site Visit Requested':
      case 'Negotiation':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Follow-Up Required':
      case 'Call Back Later':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'No Answer':
      case 'Busy':
      case 'Not Reachable':
      case 'Switched Off':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Not Interested':
      case 'Wrong Number':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-charcoal-700 border-gray-200';
    }
  };

  const formatLogDate = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#181818] px-6 py-5 text-white flex items-center justify-between border-b border-[#2A2A2A] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/20 text-gold flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Call History & Logs</h3>
                <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[11px] font-bold">
                  {logs.length} {logs.length === 1 ? 'Record' : 'Records'}
                </span>
                {enquiry.followUpDate && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-semibold flex items-center gap-1 border border-blue-400/30">
                    <CalendarCheck className="w-3 h-3" />
                    <span>Follow-up: {enquiry.followUpDate} ({enquiry.followUpTime || 'Morning'})</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-400 mt-0.5">
                <strong className="text-white font-semibold">{enquiry.name}</strong>
                {enquiry.propertyTitle ? ` · ${enquiry.propertyTitle}` : ''}
                {enquiry.phone ? ` · +91 ${enquiry.phone}` : ''}
                {enquiry.assignedToName ? ` · Rep: ${enquiry.assignedToName}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subheader with Quick Actions (Schedule Follow-up + Add Call Log) */}
        <div className="px-6 py-3 bg-surface-warm border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-charcoal-600">
            <History className="w-4 h-4 text-gold shrink-0" />
            <span>Chronological call interaction history</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Schedule Follow-up button */}
            <button
              onClick={() => {
                setShowFollowUpForm(!showFollowUpForm);
                if (showAddForm) setShowAddForm(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold/60 text-gold hover:bg-gold/10 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>{enquiry.followUpDate ? 'Reschedule Follow-up' : 'Schedule Follow-up'}</span>
            </button>

            {/* Add Call Log button */}
            {!showAddForm && (
              <button
                onClick={() => {
                  setShowAddForm(true);
                  if (showFollowUpForm) setShowFollowUpForm(false);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-black text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-gold" />
                <span>Add Call Log</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Scheduled Follow-up Banner if already scheduled */}
          {enquiry.followUpDate && !showFollowUpForm && (
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-blue-900 block">
                    Scheduled Follow-Up: {enquiry.followUpDate} at {enquiry.followUpTime || '11:00 AM'}
                  </span>
                  <span className="text-blue-700 text-[11px]">
                    Assigned Sales Rep: <strong>{enquiry.assignedToName || 'Unassigned'}</strong>
                    {enquiry.followUpNotes ? ` — "${enquiry.followUpNotes}"` : ''}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFollowUpForm(true)}
                className="text-[11px] font-bold text-blue-800 hover:underline shrink-0"
              >
                Modify
              </button>
            </div>
          )}

          {/* Schedule Follow-up Form */}
          {showFollowUpForm && (
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-4 animate-in fade-in zoom-in-98 duration-150 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    <CalendarPlus className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                    Schedule Client Follow-up
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFollowUpForm(false)}
                  className="text-xs text-charcoal-500 hover:text-charcoal-800 font-semibold"
                >
                  Cancel
                </button>
              </div>

              {followUpSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{followUpSuccessMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleScheduleFollowUp} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Follow-up Date */}
                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                      Follow-up Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-primary bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Follow-up Time */}
                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                      Time Slot (AM/PM) *
                    </label>
                    <select
                      value={followUpTime}
                      onChange={(e) => setFollowUpTime(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-primary bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Follow-up Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    Follow-up Objective / Discussion Agenda (Optional)
                  </label>
                  <input
                    type="text"
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder="e.g. Discuss revised quote, verify NRI passport paperwork, confirm site inspection..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-charcoal-700 focus:outline-none focus:border-blue-600 bg-white"
                  />
                </div>

                <div className="pt-1 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowFollowUpForm(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-charcoal-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingFollowUp}
                    className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {savingFollowUp ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>Save Follow-up</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add New Call Log Section / Form */}
          {showAddForm && (
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-gold/30 space-y-4 animate-in fade-in zoom-in-98 duration-150 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-gold/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-xs">
                    +
                  </div>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                    Add New Call Log
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-charcoal-500 hover:text-charcoal-800 font-semibold"
                >
                  Cancel
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSaveCallLog} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CALL MADE */}
                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                      CALL MADE? *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCallMade('Yes')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          callMade === 'Yes'
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white text-charcoal-600 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setCallMade('No')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          callMade === 'No'
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white text-charcoal-600 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* CALL STATUS */}
                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                      CALL STATUS *
                    </label>
                    <select
                      value={callStatus}
                      onChange={(e) => setCallStatus(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-primary bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                    >
                      {CALL_STATUS_OPTIONS.map((statusOpt) => (
                        <option key={statusOpt} value={statusOpt}>
                          {statusOpt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CALL NOTES */}
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    CALL NOTES {callMade === 'No' ? '(Why was call not made?)' : '(Optional)'}
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      callMade === 'Yes'
                        ? 'e.g. Client showed interest in the property. Requested a site inspection on Saturday morning.'
                        : 'e.g. Number was busy on initial dial, or client unreachable.'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-charcoal-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold resize-none bg-white"
                  ></textarea>
                </div>

                {/* Automatic capture note */}
                <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gold" />
                    Caller: <strong className="text-primary">{currentUser?.name || currentUser?.username || 'Admin'}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gold" />
                    Captures current timestamp
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-charcoal-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <PhoneForwarded className="w-3.5 h-3.5" />
                        <span>Save Call Log</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Previous Call Records Timeline */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">
                Previous Call Records ({logs.length})
              </h4>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-surface-warm/40">
                <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto mb-3">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h5 className="text-sm font-bold text-primary">No Call Logs Yet</h5>
                <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
                  No telephonic interactions recorded for this lead yet. Click "Add Call Log" above to record the first call.
                </p>
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-black text-white text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold" />
                    <span>Record Call Log</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
                {logs.map((log, index) => (
                  <div key={log._id || index} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-gold flex items-center justify-center shadow-xs">
                      <div className="w-2 h-2 rounded-full bg-gold"></div>
                    </div>

                    {/* Log Card */}
                    <div className="bg-surface-warm/70 hover:bg-surface-warm rounded-2xl p-4 border border-[#ECE7E1] transition-all space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary">
                            {formatLogDate(log.calledAt)}
                          </span>
                          {log.callMade === 'No' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-charcoal-600">
                              Call Not Made
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeStyle(
                            log.callStatus
                          )}`}
                        >
                          {log.callStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500">
                        <User className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span>
                          Call Made By:{' '}
                          <strong className="text-charcoal-800 font-semibold">
                            {log.calledBy || 'Admin'}
                          </strong>
                        </span>
                      </div>

                      {log.notes ? (
                        <p className="text-xs text-charcoal-700 bg-white p-3 rounded-xl border border-gray-200/80 leading-relaxed whitespace-pre-line">
                          {log.notes}
                        </p>
                      ) : (
                        <p className="text-[11px] text-charcoal-400 italic">No notes entered</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-charcoal-500">
            Enquiry ID: <span className="font-mono text-charcoal-700">{enquiry._id}</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
