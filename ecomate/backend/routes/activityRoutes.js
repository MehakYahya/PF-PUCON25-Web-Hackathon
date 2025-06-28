const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Activity = require('../models/Activity');

router.post('/', auth, async (req, res) => {
  try {
    const { type, amount, emission } = req.body;

    const activity = new Activity({
      user: req.user,
      type,
      amount,
      emission
    });

    await activity.save();
    res.status(201).json({ message: 'Activity logged successfully' });
  } catch (error) {
    console.error('Activity log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user }).sort({ createdAt: -1 }); // latest first
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activity history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
