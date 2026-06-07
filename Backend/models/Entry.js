import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: [true, 'Day number is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
      default: '',
    },
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    posterUrl: {
      type: String,
      trim: true,
      default: '',
    },
    duration: {
      type: String,
      trim: true,
      default: '',
    },
    recordedAt: {
      type: String,
      trim: true,
      default: '',
    },
    triggerType: {
      type: String,
      enum: ['none', 'qr', 'camera', 'time'],
      default: 'none',
    },
    triggerHint: {
      type: String,
      trim: true,
      default: 'Available now',
    },
    // QR-specific
    qrCode: {
      type: String,
      trim: true,
      default: '',
    },
    // Camera-specific
    cameraPrompt: {
      type: String,
      trim: true,
      default: '',
    },
    // Time-specific (minutes)
    lockDuration: {
      type: Number,
      default: 5,
    },
    // Free-text breadcrumb shown after the user finishes this entry,
    // hinting where they'll find the NEXT diary entry in the real world.
    nextLocationHint: {
      type: String,
      trim: true,
      default: '',
    },
    isLastEntry: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Sort by day number by default
entrySchema.index({ day: 1 });

const Entry = mongoose.model('Entry', entrySchema);

export default Entry;
