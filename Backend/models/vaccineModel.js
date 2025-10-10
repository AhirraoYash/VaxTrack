const mongoose = require('mongoose');

const vaccineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vaccine must have a name'],
    unique: true,
  },
  description: {
    type: String,
  },
  totalDosesInSystem: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

const Vaccine = mongoose.model('Vaccine', vaccineSchema);

module.exports = Vaccine;