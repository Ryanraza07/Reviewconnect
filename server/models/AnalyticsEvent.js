import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      trim: true
    },
    businessSlug: {
      type: String,
      required: true,
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const AnalyticsEvent =
  mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', analyticsEventSchema);

export default AnalyticsEvent;
