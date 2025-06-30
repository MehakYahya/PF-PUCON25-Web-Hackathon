const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const auth = require('../middleware/authMiddleware');
const Community = require('../models/Community');
const Challenge = require('../models/Challenge');
// Create a community
router.post('/', auth, async (req, res) => {
  const { name, description } = req.body;
  try {
    const existing = await Community.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Community name already taken' });

    const community = new Community({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id]
    });

    await community.save();
    res.status(201).json(community);
  } catch (err) {
    console.error('Error creating community:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a community
router.post('/:id/join', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });

    if (community.members.includes(req.user.id))
      return res.status(400).json({ message: 'Already a member' });

    community.members.push(req.user.id);
    await community.save();
    res.json({ message: 'Joined community' });
  } catch (err) {
    console.error('Error joining community:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List all communities
router.get('/', async (req, res) => {
  try {
    const communities = await Community.find().populate('members', 'name');
    res.json(communities);
  } catch (err) {
    console.error('Error listing communities:', err);
    res.status(500).json({ message: 'Error fetching communities' });
  }
});

// Get single community with member details (mapped to `id`)
router.get('/:id', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('members', 'name email')
      .lean(); // Make sure we can modify the result easily

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Map _id to id for frontend compatibility
    community.members = community.members.map(member => ({
      ...member,
      id: member._id.toString(),
    }));

    res.json(community);
  } catch (err) {
    console.error('Error fetching community:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//--------------------------------------
// 🟢 Challenge Routes
//--------------------------------------

// Create a challenge in a community
router.post('/:id/challenges', auth, async (req, res) => {
  try {
    const { title, description, reward, deadline } = req.body;

    if (!title || !description || !reward || !deadline) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Only members can create challenges' });
    }

    const challenge = new Challenge({
      community: req.params.id,
      createdBy: req.user.id,
      title,
      description,
      reward,
      deadline,
    });

    await challenge.save();
    res.status(201).json(challenge);
  } catch (err) {
    console.error('Error creating challenge:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all challenges for a community
router.get('/:id/challenges', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find({ community: req.params.id }).sort({ deadline: 1 });
    res.json(challenges);
  } catch (err) {
    console.error('Error fetching challenges:', err);
    res.status(500).json({ message: 'Error fetching challenges' });
  }
});

//contribution 
// Join a specific challenge
router.post('/:id/challenges/:challengeId/participate', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community || !community.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not a member of this community' });
    }

    const challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (challenge.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }

    challenge.participants.push(req.user.id);
    await challenge.save();

    res.json({ message: 'Successfully joined the challenge' });
  } catch (err) {
    console.error('Error joining challenge:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// POST /api/communities/:id/challenges/:challengeId/contribute
const Contribution = require('../models/ChallengeContribution');

router.post('/:id/challenges/:challengeId/contribute', auth, async (req, res) => {
  try {
    const { description, points } = req.body;
    const { id, challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge || challenge.community.toString() !== id)
      return res.status(404).json({ message: 'Challenge not found in this community' });

    if (!challenge.participants.includes(req.user.id))
      return res.status(403).json({ message: 'You must join the challenge first' });

    const contribution = new Contribution({
      challenge: challengeId,
      user: req.user.id,
      description,
      points
    });

    await contribution.save();
    res.status(201).json({ message: 'Contribution submitted', contribution });
  } catch (err) {
    console.error('Contribution error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get contributions for a challenge
router.get('/:id/challenges/:challengeId/contributions', auth, async (req, res) => {
  try {
    const contributions = await Contribution.find({ challenge: req.params.challengeId })
      .populate('user', 'name'); // So we can access user.name
    res.json(contributions);
  } catch (err) {
    console.error('Error fetching contributions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//LeaderBoard
router.get('/:id/leaderboard', auth, async (req, res) => {
  try {
    const { id: communityId } = req.params;

    const leaderboard = await Contribution.aggregate([
      {
        $lookup: {
          from: 'challenges',
          localField: 'challenge',
          foreignField: '_id',
          as: 'challengeInfo',
        },
      },
      { $unwind: '$challengeInfo' },
      { $match: { 'challengeInfo.community': new mongoose.Types.ObjectId(communityId) } },
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$points' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$user._id',
          name: '$user.name',
          totalPoints: 1,
        },
      },
      { $sort: { totalPoints: -1 } },
    ]);

    res.json(leaderboard);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
