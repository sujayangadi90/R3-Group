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
      default: '',
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
    siteVisitStatus: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show', ''],
      default: 'Scheduled',
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
      enum: ['New', 'Contacted', 'In Discussion', 'Site Visit', 'Negotiation', 'Closed', 'Lost'],
      default: 'New',
    },
    temperature: {
      type: String,
      enum: ['Cold', 'Warm', 'Hot', ''],
      default: 'Warm',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedToName: {
      type: String,
      default: '',
    },
    leadSource: {
      type: String,
      default: '', // e.g. "Google Search", "Phone Call", "Walk-in", "Referral", etc.
      trim: true,
    },
    referralName: {
      type: String,
      default: '',
      trim: true,
    },
    brokerName: {
      type: String,
      default: '',
      trim: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: String,
      default: '', // 'YYYY-MM-DD'
    },
    followUpTime: {
      type: String,
      default: '', // e.g. '11:00 AM'
    },
    followUpStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled', 'Overdue', ''],
      default: '',
    },
    followUpNotes: {
      type: String,
      default: '',
      trim: true,
    },
    callLogs: [
      {
        callMade: {
          type: String,
          enum: ['Yes', 'No'],
          default: 'Yes',
        },
        callStatus: {
          type: String,
          required: true,
          trim: true,
        },
        notes: {
          type: String,
          default: '',
          trim: true,
        },
        calledBy: {
          type: String,
          default: 'Admin',
        },
        calledById: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
        calledAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Enquiry', enquirySchema);
