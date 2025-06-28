const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },// don't forget password for auth!
  carbonGoal: {
    type: Number,
    default: 0
  },
  currentFootprint: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
