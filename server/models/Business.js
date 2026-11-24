import mongoose from 'mongoose';

const reviewCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true }
  },
  { _id: false }
);

const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

const businessSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    contactName: {
      type: String,
      default: ''
    },
    contactNumber: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: '',
      trim: true
    },
    socialLinks: {
      website: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
      linkedin: { type: String, default: '' }
    },
    location: {
      type: String,
      default: ''
    },
    locationLink: {
      type: String,
      default: ''
    },
    businessSummary: {
      type: String,
      default: ''
    },
    businessProfileJson: {
      type: String,
      default: ''
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 80
    },
    category: {
      type: String,
      required: true,
      enum: [
        'restaurant',
        'salon',
        'clinic',
        'general_store',
        'optical',
        'pharmacy',
        'electronics',
        'fashion',
        'gym',
        'automobile',
        'hotel'
      ],
      default: 'restaurant'
    },
    description: {
      type: String,
      default: ''
    },
    logo: {
      type: String,
      default: ''
    },
    googleReviewUrl: {
      type: String,
      default: ''
    },
    branding: {
      primaryColor: { type: String, default: '#2563eb' },
      secondaryColor: { type: String, default: '#0f172a' }
    },
    welcomeMessage: {
      type: String,
      default: 'Thanks for visiting us! We would love to hear about your experience.'
    },
    supportedLanguages: {
      type: [String],
      default: ['English']
    },
    reviewCategories: {
      type: [reviewCategorySchema],
      default: []
    },
    templateSettings: {
      enabled: { type: Boolean, default: true },
      defaultTone: { type: String, default: 'natural' }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

businessSchema.pre('validate', function setSlug(next) {
  if (!this.slug && this.businessName) {
    this.slug = slugify(this.businessName);
  }

  if (this.slug) {
    this.slug = slugify(this.slug);
  }

  next();
});

const Business = mongoose.models.Business || mongoose.model('Business', businessSchema);

export default Business;
