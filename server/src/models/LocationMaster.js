import mongoose from 'mongoose';

const locationMasterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      unique: true,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    localities: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        pincode: {
          type: String,
          trim: true,
          default: '',
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save or indexing
locationMasterSchema.index({ name: 1 });

export default mongoose.model('LocationMaster', locationMasterSchema);
