import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    minutes: { type: Number, required: true, min: 0 },
    mode: { type: String, enum: ['focus', 'short', 'long'], default: 'focus' },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('PomodoroSession', sessionSchema);
