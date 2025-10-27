const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs'); // <-- REMOVED

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
  location: { 
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
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
    unique: true,
  },
  
  // This is the ONE common PIN, stored as plain text
  staffPin: { 
    type: String,
    required: true,
  },

  // This is just a list of staff identifiers (e.g., their email or a name)
  staff: [
    {
      type: String,
      trim: true,
    }
  ],

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

// --- HOOKS AND METHODS REMOVED ---
// campSchema.pre('save', ...); // <-- REMOVED
// campSchema.methods.matchStaffPin = ...; // <-- REMOVED

const Camp = mongoose.model('Camp', campSchema);
module.exports = Camp;