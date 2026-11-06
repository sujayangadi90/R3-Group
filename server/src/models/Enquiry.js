import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['contact', 'site_visit', 'sell_property', 'general'],
      default: 'general',
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    subject: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    propertyTitle: {
      type: String,
      default: '',
    },
    preferredDate: {
      type: String,
      default: '',
    },
    preferredTime: {
      type: String,
      default: '',
    },
    sellDetails: {
      propertyTitle: { type: String, default: '' },
      propertyType: { type: String, default: '' },
      location: { type: String, default: '' },
      expectedPrice: { type: String, default: '' },
      carpetArea: { type: String, default: '' },
      bedrooms: { type: String, default: '' },
      additionalNotes: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'In Discussion', 'Site Visit', 'Closed'],
      default: 'New',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Enquiry', enquirySchema);
