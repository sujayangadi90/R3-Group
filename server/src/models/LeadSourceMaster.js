import mongoose from 'mongoose';

const leadSourceMasterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead source name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
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

leadSourceMasterSchema.index({ name: 1 });

export default mongoose.model('LeadSourceMaster', leadSourceMasterSchema);
