import express from 'express';
import LocationMaster from '../models/LocationMaster.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Default seed data for initial cities and localities if empty
const defaultLocations = [
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    localities: [
      { name: 'Worli & Sea Face', isActive: true },
      { name: 'Altamount Road', isActive: true },
      { name: 'Bandra West & Pali Hill', isActive: true },
      { name: 'Nariman Point & Marine Drive', isActive: true },
      { name: 'Cuffe Parade & Colaba', isActive: true },
      { name: 'Lower Parel', isActive: true },
      { name: 'Juhu', isActive: true },
      { name: 'Malabar Hill', isActive: true },
      { name: 'BKC (Bandra Kurla Complex)', isActive: true },
    ],
  },
  {
    name: 'Alibaug',
    state: 'Maharashtra',
    localities: [
      { name: 'Mandwa & Awas', isActive: true },
      { name: 'Zirad', isActive: true },
      { name: 'Kihim', isActive: true },
      { name: 'Varsoli', isActive: true },
    ],
  },
  {
    name: 'Lonavala & Khandala',
    state: 'Maharashtra',
    localities: [
      { name: 'Tungarli', isActive: true },
      { name: 'Valvan', isActive: true },
      { name: 'Kune Village', isActive: true },
      { name: 'Gold Valley', isActive: true },
    ],
  },
  {
    name: 'Goa',
    state: 'Goa',
    localities: [
      { name: 'Assagao', isActive: true },
      { name: 'Anjuna & Vagator', isActive: true },
      { name: 'Candolim', isActive: true },
      { name: 'Siolim', isActive: true },
    ],
  },
];

// Seed helper
const ensureDefaults = async () => {
  const count = await LocationMaster.countDocuments();
  if (count === 0) {
    await LocationMaster.insertMany(defaultLocations);
  }
};

// GET /api/locations - Public: List active cities with active localities
router.get('/', async (req, res) => {
  try {
    await ensureDefaults();
    const { all } = req.query; // If admin requests all including inactive

    const query = all === 'true' ? {} : { isActive: true };
    const cities = await LocationMaster.find(query).sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ success: false, message: 'Server error fetching locations' });
  }
});

// POST /api/locations - Admin: Add a new city
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, state, localities = [] } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'City name is required' });
    }

    const trimmedName = name.trim();
    const existing = await LocationMaster.findOne({
      name: { $regex: `^${trimmedName}$`, $options: 'i' },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: `City "${trimmedName}" already exists` });
    }

    const formattedLocalities = Array.isArray(localities)
      ? localities
          .filter((l) => (typeof l === 'string' ? l.trim() : l?.name?.trim()))
          .map((l) =>
            typeof l === 'string'
              ? { name: l.trim(), isActive: true }
              : { name: l.name.trim(), pincode: l.pincode || '', isActive: l.isActive !== false }
          )
      : [];

    const newCity = await LocationMaster.create({
      name: trimmedName,
      state: (state || '').trim(),
      localities: formattedLocalities,
    });

    res.status(201).json({
      success: true,
      message: 'City created successfully',
      data: newCity,
    });
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating city' });
  }
});

// PUT /api/locations/:id - Admin: Update city details (name, state, isActive, sortOrder)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, state, isActive, sortOrder } = req.body;

    const city = await LocationMaster.findById(id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    if (name && name.trim()) {
      city.name = name.trim();
    }
    if (state !== undefined) {
      city.state = state.trim();
    }
    if (isActive !== undefined) {
      city.isActive = Boolean(isActive);
    }
    if (sortOrder !== undefined) {
      city.sortOrder = Number(sortOrder);
    }

    await city.save();

    res.json({
      success: true,
      message: 'City updated successfully',
      data: city,
    });
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating city' });
  }
});

// DELETE /api/locations/:id - Admin: Delete a city
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await LocationMaster.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    res.json({
      success: true,
      message: 'City deleted successfully',
      data: deleted,
    });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ success: false, message: 'Server error deleting city' });
  }
});

// POST /api/locations/:id/localities - Admin: Add locality to a city
router.post('/:id/localities', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, pincode } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Locality name is required' });
    }

    const city = await LocationMaster.findById(id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    const trimmedName = name.trim();
    const exists = city.localities.some(
      (l) => l.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: `Locality "${trimmedName}" already exists in ${city.name}`,
      });
    }

    city.localities.push({
      name: trimmedName,
      pincode: pincode ? pincode.trim() : '',
      isActive: true,
    });

    await city.save();

    res.status(201).json({
      success: true,
      message: 'Locality added successfully',
      data: city,
    });
  } catch (error) {
    console.error('Error adding locality:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error adding locality' });
  }
});

// PUT /api/locations/:id/localities/:localityId - Admin: Update a locality in a city
router.put('/:id/localities/:localityId', verifyAdmin, async (req, res) => {
  try {
    const { id, localityId } = req.params;
    const { name, pincode, isActive } = req.body;

    const city = await LocationMaster.findById(id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    const locality = city.localities.id(localityId);
    if (!locality) {
      return res.status(404).json({ success: false, message: 'Locality not found' });
    }

    if (name && name.trim()) {
      locality.name = name.trim();
    }
    if (pincode !== undefined) {
      locality.pincode = pincode.trim();
    }
    if (isActive !== undefined) {
      locality.isActive = Boolean(isActive);
    }

    await city.save();

    res.json({
      success: true,
      message: 'Locality updated successfully',
      data: city,
    });
  } catch (error) {
    console.error('Error updating locality:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating locality' });
  }
});

// DELETE /api/locations/:id/localities/:localityId - Admin: Delete a locality from a city
router.delete('/:id/localities/:localityId', verifyAdmin, async (req, res) => {
  try {
    const { id, localityId } = req.params;

    const city = await LocationMaster.findById(id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    city.localities.pull({ _id: localityId });
    await city.save();

    res.json({
      success: true,
      message: 'Locality removed successfully',
      data: city,
    });
  } catch (error) {
    console.error('Error removing locality:', error);
    res.status(500).json({ success: false, message: 'Server error removing locality' });
  }
});

export default router;
