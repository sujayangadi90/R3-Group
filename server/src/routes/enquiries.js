import express from 'express';
import Enquiry from '../models/Enquiry.js';
import Property from '../models/Property.js';
import { verifyAdmin } from '../middleware/auth.js';

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
    const { type, status, search, startDate, endDate, assignedTo, temperature, page = 1, limit = 50 } = req.query;

    const query = {};

    if (type && type !== 'all') {
      query.type = type;
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

// PATCH /api/enquiries/:id - Update status / notes / assigned rep / temperature (Admin Only)
router.patch('/:id', verifyAdmin, async (req, res) => {
  try {
    const { status, adminNotes, assignedTo, assignedToName, temperature } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (status) enquiry.status = status;
    if (temperature !== undefined) enquiry.temperature = temperature;
    if (adminNotes !== undefined) enquiry.adminNotes = adminNotes;
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

// DELETE /api/enquiries/:id - Delete enquiry (Admin Only)
router.delete('/:id', verifyAdmin, async (req, res) => {
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
