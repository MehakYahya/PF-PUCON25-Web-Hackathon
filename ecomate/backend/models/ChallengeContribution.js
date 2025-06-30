// models/ChallengeContribution.js
const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChallengeContribution', contributionSchema);
