import mongoose from 'mongoose';

const sellRequestSchema = new mongoose.Schema(
  {
    // 1. Owner / Representative Credentials
    name: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },

    // 2. Property Particulars
    propertyTitle: {
      type: String,
      required: [true, 'Property name / building is required'],
      trim: true,
    },
    propertyType: {
      type: String,
      default: 'Penthouse',
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location / neighborhood is required'],
      trim: true,
    },
    carpetArea: {
      type: String,
      required: [true, 'Carpet area is required'],
      trim: true,
    },
    bedrooms: {
      type: String,
      default: '4 BHK',
      trim: true,
    },
    expectedPrice: {
      type: String,
      required: [true, 'Expected target price is required'],
      trim: true,
    },
    additionalNotes: {
      type: String,
      default: '',
      trim: true,
    },

    // Admin Internal Remarks
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

sellRequestSchema.index({ createdAt: -1 });

export default mongoose.model('SellRequest', sellRequestSchema);
