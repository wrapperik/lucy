import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema(
  {
    entryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Entry',
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    emoji: {
      type: String,
      required: true,
      enum: ['❤️', '🔥', '😢', '✨'],
    },
  },
  {
    timestamps: true,
  }
);

reactionSchema.index({ entryId: 1, userId: 1, emoji: 1 }, { unique: true });

const Reaction = mongoose.model('Reaction', reactionSchema);

export default Reaction;
