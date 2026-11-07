import express from 'express';
import SellRequest from '../models/SellRequest.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/sell-requests - Submit confidential property divestment request (Public B2C)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      propertyTitle,
      propertyType,
      location,
      expectedPrice,
      carpetArea,
      bedrooms,
      additionalNotes,
    } = req.body;

    if (!name || !phone || !email || !propertyTitle || !location || !expectedPrice || !carpetArea) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required property submission particulars.',
      });
    }

    const sellReq = new SellRequest({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      propertyTitle: propertyTitle.trim(),
      propertyType: propertyType || 'Penthouse',
      location: location.trim(),
      carpetArea: carpetArea.trim(),
      bedrooms: bedrooms || '4 BHK',
      expectedPrice: expectedPrice.trim(),
      additionalNotes: additionalNotes ? additionalNotes.trim() : '',
    });

    const saved = await sellReq.save();

    res.status(201).json({
      success: true,
      message: 'Property submission received successfully for confidential advisory.',
      data: saved,
    });
  } catch (error) {
    console.error('Error creating sell request:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error saving submission.' });
  }
});

// GET /api/sell-requests - List sell property requests with date filter & pagination (Admin Only)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { search, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};

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
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { propertyTitle: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { additionalNotes: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await SellRequest.countDocuments(query);
    const requests = await SellRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      data: requests,
    });
  } catch (error) {
    console.error('Error fetching sell requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/sell-requests/:id - Update internal notes (Admin Only)
router.patch('/:id', verifyAdmin, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const updated = await SellRequest.findByIdAndUpdate(
      req.params.id,
      { adminNotes: adminNotes || '' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Sell property request not found' });
    }

    res.json({
      success: true,
      message: 'Internal notes updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/sell-requests/:id - Delete a sell request (Admin Only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const deleted = await SellRequest.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Sell property request not found' });
    }

    res.json({
      success: true,
      message: 'Sell property request removed successfully',
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
