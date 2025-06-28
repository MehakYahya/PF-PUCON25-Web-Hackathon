const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  emission: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
