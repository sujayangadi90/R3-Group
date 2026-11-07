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
      default: 0,
    },
    priceDisplay: {
      type: String,
      default: 'Price on Request',
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
      type: mongoose.Schema.Types.Mixed, // Can be Number (3) or String ("3, 4, 5 BHK")
      default: 3,
    },
    bathrooms: {
      type: mongoose.Schema.Types.Mixed, // Can be Number (3) or String ("3 - 5 Baths")
      default: 3,
    },
    carpetArea: {
      type: mongoose.Schema.Types.Mixed, // Can be Number (6450) or String ("3,500 - 6,450 sq.ft")
      default: '',
    },
    configurations: [
      {
        bhk: { type: String, default: '' }, // e.g. "3 BHK", "4 BHK", "5 BHK Duplex"
        bathrooms: { type: String, default: '' }, // e.g. "3", "4.5"
        dimensions: { type: String, default: '' }, // e.g. "3,200 sq.ft", "45 x 60 ft"
        carpetArea: { type: String, default: '' }, // e.g. "2,850 sq.ft"
        price: { type: String, default: 'Price on Request' }, // e.g. "Price on Request"
      },
    ],
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
