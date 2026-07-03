const User = require('../models/User');

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    let user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create or update user after Clerk sign up / login
const syncUser = async (req, res) => {
  try {
    const { name, email, profileImage } = req.body;
    const clerkId = req.auth.userId;
    
    let user = await User.findOne({ clerkId });
    if (!user) {
      user = new User({
        clerkId,
        name,
        email,
        profileImage
      });
      await user.save();
    } else {
      user.name = name || user.name;
      user.email = email || user.email;
      user.profileImage = profileImage || user.profileImage;
      await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Select Role (Parent/Mentee)
const selectRole = async (req, res) => {
  try {
    const { role } = req.body;
    const clerkId = req.auth.userId;
    
    let user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.role = role;
    if (role === 'Parent' && !user.inviteCode) {
      // Generate invite code for parent
      user.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Link Mentee to Parent via Invite Code
const linkParent = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const clerkId = req.auth.userId;
    
    let mentee = await User.findOne({ clerkId });
    if (!mentee) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    const parent = await User.findOne({ inviteCode, role: 'Parent' });
    if (!parent) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }
    
    mentee.linkedParentId = parent._id;
    await mentee.save();
    res.json({ message: 'Linked successfully', parent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Refresh / Regenerate Invite Code
const refreshInviteCode = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    let user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'Parent') return res.status(403).json({ message: 'Only parents can refresh invite codes' });

    user.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  syncUser,
  selectRole,
  linkParent,
  refreshInviteCode
};
