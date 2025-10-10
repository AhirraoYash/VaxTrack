const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// A sub-schema for the staff array
const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pin: { // Staff member's personal PIN for this camp
    type: String,
    required: true,
  },
});

const campSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A camp must have a name'],
  },
  organizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: { // GeoJSON for map integration
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: { // Format: [longitude, latitude]
      type: [Number],
      required: true,
    },
  },
  address: {
    type: String,
    required: [true, 'A camp must have an address'],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  campAccessCode: {
    type: String,
    required: true,
  },
  staff: [staffSchema],
  vaccineInventory: [{
    vaccine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vaccine',
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
}, { timestamps: true });

// Index for efficient map-based searches
campSchema.index({ location: '2dsphere' });

// Mongoose hook to hash the staff PINs before saving
campSchema.pre('save', async function(next) {
  if (!this.isModified('staff')) return next();
  
  const promises = this.staff.map(async (staffMember) => {
    if (staffMember.isModified('pin')) {
      staffMember.pin = await bcrypt.hash(staffMember.pin, 10);
    }
  });
  await Promise.all(promises);
  next();
});

const Camp = mongoose.model('Camp', campSchema);
module.exports = Camp;