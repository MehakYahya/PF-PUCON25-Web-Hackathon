const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const generateToken = require('../utils/generateToken');
const Activity = require('../models/Activity'); // Moved to top

// Register
router.post('/register', async (req, res) => {
  let { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  email = email.toLowerCase();

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();

   res.status(201).json({
  message: 'User registered successfully',
  token: generateToken(user),
  user: { id: user._id, name: user.name, email: user.email }  // ✅ include id
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login ✅ FIXED: added id
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken(user);

    res.json({
  token,
  user: { id: user._id, name: user.name, email: user.email }  // ✅ include id
});
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected profile
router.get('/profile', auth, async (req, res) => {
  try {
const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get current user with carbon footprint
router.get('/me', auth, async (req, res) => {
  try {
const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

const activities = await Activity.find({ user: req.user.id });
    const totalFootprint = activities.reduce((sum, a) => sum + a.emission, 0);

    res.json({
      ...user.toObject(),
      currentFootprint: totalFootprint
    });
  } catch (error) {
    console.error("Fetch user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update carbon goal
router.put('/goal', auth, async (req, res) => {
  const { carbonGoal } = req.body;
  try {
const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.carbonGoal = carbonGoal;
    await user.save();
    res.json({ message: 'Goal updated successfully', goal: user.carbonGoal });
  } catch (error) {
    console.error("Goal update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
