import express from 'express';
import mongoose from 'mongoose';
import Property from '../models/Property.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate slug
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// GET /api/properties - List properties with filtering & sorting
router.get('/', async (req, res) => {
  try {
    const {
      type,
      status,
      bedrooms,
      location,
      city,
      featured,
      search,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (type && type !== 'All') {
      query.propertyType = type;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (bedrooms && bedrooms !== 'All') {
      if (bedrooms === '5+') {
        query.bedrooms = { $gte: 5 };
      } else {
        query.bedrooms = Number(bedrooms);
      }
    }

    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    if (city && city !== 'All') {
      query.city = { $regex: city, $options: 'i' };
    }

    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { propertyType: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'area_desc') sortOption = { carpetArea: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: properties.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/properties/:idOrSlug - Get single property
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let property;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      property = await Property.findById(idOrSlug);
    }

    if (!property) {
      property = await Property.findOne({ slug: idOrSlug });
    }

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Increment views count asynchronously
    Property.findByIdAndUpdate(property._id, { $inc: { viewsCount: 1 } }).exec();

    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/properties - Create Property (Admin Only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const propertyData = req.body;

    if (!propertyData.title) {
      return res.status(400).json({ success: false, message: 'Property title is required' });
    }

    // Generate unique slug if not provided
    if (!propertyData.slug) {
      let baseSlug = generateSlug(propertyData.title);
      let uniqueSlug = baseSlug;
      let count = 1;
      while (await Property.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${count}`;
        count++;
      }
      propertyData.slug = uniqueSlug;
    }

    // Ensure priceDisplay if not given
    if (!propertyData.priceDisplay && propertyData.price) {
      const priceNum = Number(propertyData.price);
      if (priceNum >= 10000000) {
        propertyData.priceDisplay = `₹ ${(priceNum / 10000000).toFixed(2)} Cr`;
      } else {
        propertyData.priceDisplay = `₹ ${(priceNum / 100000).toFixed(2)} Lakhs`;
      }
    }

    const newProperty = new Property(propertyData);
    const savedProperty = await newProperty.save();

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: savedProperty,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/properties/:id - Update Property (Admin Only)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Update fields
    Object.assign(property, updates);
    const updatedProperty = await property.save();

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/properties/:id/toggle-featured - Toggle featured status (Admin Only)
router.patch('/:id/toggle-featured', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    property.featured = !property.featured;
    await property.save();

    res.json({
      success: true,
      message: `Property marked as ${property.featured ? 'Featured' : 'Standard'}`,
      data: property,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/properties/:id - Delete Property (Admin Only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Property.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.json({
      success: true,
      message: 'Property deleted successfully',
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
