import express from 'express';
import Enquiry from '../models/Enquiry.js';
import Property from '../models/Property.js';
import { verifyAdmin, verifySuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/enquiries - Submit new enquiry (Public)
router.post('/', async (req, res) => {
  try {
    const {
      type = 'general',
      name,
      email = '',
      phone,
      subject,
      message,
      propertyId,
      propertyTitle,
      preferredDate,
      preferredTime,
      sellDetails,
      status = 'New',
      temperature = 'Warm',
      assignedTo = null,
      assignedToName = '',
      leadSource = '',
      referralName = '',
      brokerName = '',
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required.',
      });
    }

    let finalPropertyTitle = propertyTitle || '';
    if (propertyId && !finalPropertyTitle) {
      const prop = await Property.findById(propertyId);
      if (prop) finalPropertyTitle = prop.title;
    }

    const enquiry = new Enquiry({
      type,
      name: name.trim(),
      email: (email || '').trim(),
      phone: phone.trim(),
      subject: subject || (type === 'sell_property' ? 'Property Sale Valuation Request' : type === 'site_visit' ? 'Site Visit Booking' : 'General Enquiry'),
      message: message || '',
      propertyId: propertyId || null,
      propertyTitle: finalPropertyTitle,
      preferredDate: preferredDate || '',
      preferredTime: preferredTime || '',
      sellDetails: sellDetails || {},
      status,
      temperature,
      assignedTo: assignedTo || null,
      assignedToName: assignedToName || '',
      leadSource: leadSource || '',
      referralName: referralName || '',
      brokerName: brokerName || '',
    });

    const savedEnquiry = await enquiry.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been received. Our luxury advisory desk will contact you within 24 hours.',
      data: savedEnquiry,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/enquiries - List enquiries (Admin Only)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const {
      type,
      status,
      siteVisitStatus,
      isSiteVisit,
      isFollowUp,
      followUpStatus,
      search,
      startDate,
      endDate,
      assignedTo,
      temperature,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (isFollowUp === 'true') {
      // Must have scheduled a follow-up date
      query.followUpDate = { $exists: true, $ne: '' };
    }

    if (followUpStatus && followUpStatus !== 'all') {
      query.followUpStatus = followUpStatus;
    }

    if (isSiteVisit === 'true') {
      // Filter any enquiry that has a scheduled site visit (type === 'site_visit' OR status === 'Site Visit' OR has preferredDate)
      query.$or = [
        { type: 'site_visit' },
        { status: 'Site Visit' },
        { preferredDate: { $exists: true, $ne: '' } },
      ];
    } else if (type && type !== 'all') {
      query.type = type;
    }

    if (siteVisitStatus && siteVisitStatus !== 'all') {
      query.siteVisitStatus = siteVisitStatus;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (temperature && temperature !== 'all') {
      query.temperature = temperature;
    }

    if (assignedTo && assignedTo !== 'all') {
      query.assignedTo = assignedTo;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { propertyTitle: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Enquiry.countDocuments(query);
    const enquiries = await Enquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('propertyId', 'title slug priceDisplay location propertyType');

    const unreadCount = await Enquiry.countDocuments({ status: 'New' });

    res.json({
      success: true,
      count: enquiries.length,
      total,
      unreadCount,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: enquiries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/enquiries/:id - Single enquiry (Admin Only)
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id).populate('propertyId');
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/enquiries/:id - Update status / notes / assigned rep / temperature / lead source / site visit (Admin Only)
router.patch('/:id', verifyAdmin, async (req, res) => {
  try {
    const {
      status,
      adminNotes,
      assignedTo,
      assignedToName,
      temperature,
      leadSource,
      referralName,
      brokerName,
      preferredDate,
      preferredTime,
      siteVisitStatus,
      followUpDate,
      followUpTime,
      followUpStatus,
      followUpNotes,
      propertyId,
      propertyTitle,
    } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (status) enquiry.status = status;
    if (temperature !== undefined) enquiry.temperature = temperature;
    if (adminNotes !== undefined) enquiry.adminNotes = adminNotes;
    if (leadSource !== undefined) enquiry.leadSource = leadSource;
    if (referralName !== undefined) enquiry.referralName = referralName;
    if (brokerName !== undefined) enquiry.brokerName = brokerName;
    if (preferredDate !== undefined) enquiry.preferredDate = preferredDate;
    if (preferredTime !== undefined) enquiry.preferredTime = preferredTime;
    if (siteVisitStatus !== undefined) enquiry.siteVisitStatus = siteVisitStatus;
    if (followUpDate !== undefined) enquiry.followUpDate = followUpDate;
    if (followUpTime !== undefined) enquiry.followUpTime = followUpTime;
    if (followUpStatus !== undefined) enquiry.followUpStatus = followUpStatus;
    if (followUpNotes !== undefined) enquiry.followUpNotes = followUpNotes;
    if (propertyId !== undefined) enquiry.propertyId = propertyId;
    if (propertyTitle !== undefined) enquiry.propertyTitle = propertyTitle;
    if (assignedTo !== undefined) {
      enquiry.assignedTo = assignedTo || null;
      enquiry.assignedToName = assignedToName || '';
    }

    const updated = await enquiry.save();

    res.json({
      success: true,
      message: 'Enquiry updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/enquiries/:id/call-logs - Add a call log entry (Admin Only)
router.post('/:id/call-logs', verifyAdmin, async (req, res) => {
  try {
    const { callMade = 'Yes', callStatus, notes = '' } = req.body;

    if (!callStatus) {
      return res.status(400).json({ success: false, message: 'Call Status is required' });
    }

    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    const callerName = req.user?.name || req.user?.username || 'Admin';
    const callerId = req.user?.id || null;

    const newLog = {
      callMade: callMade === 'No' ? 'No' : 'Yes',
      callStatus: callStatus.trim(),
      notes: notes.trim(),
      calledBy: callerName,
      calledById: callerId,
      calledAt: new Date(),
    };

    if (!Array.isArray(enquiry.callLogs)) {
      enquiry.callLogs = [];
    }

    // Add to beginning of array so newest is first
    enquiry.callLogs.unshift(newLog);

    await enquiry.save();

    res.status(201).json({
      success: true,
      message: 'Call log added successfully',
      data: enquiry.callLogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/enquiries/:id - Delete enquiry (Super Admin Only)
router.delete('/:id', verifySuperAdmin, async (req, res) => {
  try {
    const deleted = await Enquiry.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json({
      success: true,
      message: 'Enquiry removed successfully',
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
