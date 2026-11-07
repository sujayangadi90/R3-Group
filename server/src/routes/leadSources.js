import express from 'express';
import LeadSourceMaster from '../models/LeadSourceMaster.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// The 14 exact lead sources requested by the user
export const defaultLeadSources = [
  'Google Search',
  'Google Ads',
  'Facebook',
  'Instagram',
  'Facebook / Instagram Ads',
  'Property Portals',
  'WhatsApp',
  'Phone Call',
  'Walk-in',
  'Referral',
  'Broker / Channel Partner',
  'Hoardings / Outdoor Ads',
  'Newspaper / Print Media',
  'Events / Property Exhibitions',
  'Email',
];

const ensureDefaultLeadSources = async () => {
  const count = await LeadSourceMaster.countDocuments();
  if (count === 0) {
    const docs = defaultLeadSources.map((name, index) => ({
      name,
      sortOrder: index,
      isActive: true,
    }));
    await LeadSourceMaster.insertMany(docs);
  }
};

// GET /api/lead-sources - List active or all lead sources
router.get('/', async (req, res) => {
  try {
    await ensureDefaultLeadSources();
    const { all } = req.query;
    const query = all === 'true' ? {} : { isActive: true };
    const sources = await LeadSourceMaster.find(query).sort({ sortOrder: 1, createdAt: 1 });

    res.json({
      success: true,
      data: sources,
    });
  } catch (error) {
    console.error('Error fetching lead sources:', error);
    res.status(500).json({ success: false, message: 'Server error fetching lead sources' });
  }
});

// POST /api/lead-sources - Add a new lead source (Admin Only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, category = 'General', sortOrder = 0 } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Lead source name is required' });
    }

    const trimmed = name.trim();
    const existing = await LeadSourceMaster.findOne({
      name: { $regex: `^${trimmed}$`, $options: 'i' },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: `Lead source "${trimmed}" already exists` });
    }

    const newSource = await LeadSourceMaster.create({
      name: trimmed,
      category: category.trim(),
      sortOrder: Number(sortOrder) || 0,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Lead source created successfully',
      data: newSource,
    });
  } catch (error) {
    console.error('Error creating lead source:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating lead source' });
  }
});

// PUT /api/lead-sources/:id - Update lead source (Admin Only)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, isActive, sortOrder } = req.body;

    const source = await LeadSourceMaster.findById(id);
    if (!source) {
      return res.status(404).json({ success: false, message: 'Lead source not found' });
    }

    if (name && name.trim()) {
      source.name = name.trim();
    }
    if (category !== undefined) {
      source.category = category.trim();
    }
    if (isActive !== undefined) {
      source.isActive = Boolean(isActive);
    }
    if (sortOrder !== undefined) {
      source.sortOrder = Number(sortOrder);
    }

    await source.save();

    res.json({
      success: true,
      message: 'Lead source updated successfully',
      data: source,
    });
  } catch (error) {
    console.error('Error updating lead source:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating lead source' });
  }
});

// DELETE /api/lead-sources/:id - Delete lead source (Admin Only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await LeadSourceMaster.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Lead source not found' });
    }

    res.json({
      success: true,
      message: 'Lead source deleted successfully',
      data: deleted,
    });
  } catch (error) {
    console.error('Error deleting lead source:', error);
    res.status(500).json({ success: false, message: 'Server error deleting lead source' });
  }
});

export default router;
