import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
    },
    propertyType: {
      type: String,
      required: true,
      enum: ['Apartment', 'Villa', 'Penthouse', 'Plot', 'Commercial'],
      default: 'Apartment',
    },
    price: {
      type: Number, // Stored in full numeric value e.g. 38500000 for 3.85 Cr
      required: true,
    },
    priceDisplay: {
      type: String,
      required: true, // e.g. "₹ 3.85 Cr - ₹ 4.50 Cr" or "₹ 18.5 Cr"
    },
    location: {
      type: String,
      required: true, // e.g. "Worli Sea Face"
    },
    city: {
      type: String,
      default: 'Mumbai',
    },
    address: {
      type: String,
      default: '',
    },
    bedrooms: {
      type: Number,
      default: 3,
    },
    bathrooms: {
      type: Number,
      default: 3,
    },
    carpetArea: {
      type: Number, // sq.ft
      required: true,
    },
    totalArea: {
      type: Number, // sq.ft
      default: 0,
    },
    floor: {
      type: String,
      default: 'Higher Floor',
    },
    totalFloors: {
      type: Number,
      default: 45,
    },
    status: {
      type: String,
      enum: ['Ready to Move', 'Under Construction', 'Pre-Launch', 'Sold Out'],
      default: 'Ready to Move',
    },
    possessionDate: {
      type: String,
      default: 'Immediate',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
      default: [],
    },
    floorPlanImage: {
      type: String,
      default: '',
    },
    amenities: {
      type: [String],
      default: [],
    },
    specifications: [
      {
        label: { type: String },
        value: { type: String },
      },
    ],
    localityHighlights: [
      {
        title: { type: String },
        distance: { type: String },
        category: { type: String, default: 'Transit' },
      },
    ],
    reraId: {
      type: String,
      default: 'P51800028941',
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

propertySchema.index({ title: 'text', description: 'text', location: 'text' });

export default mongoose.model('Property', propertySchema);
