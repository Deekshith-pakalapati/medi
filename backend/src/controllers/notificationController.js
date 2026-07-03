const Notification = require('../models/Notification');
const User = require('../models/User');

const getNotifications = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { readStatus: true }, { new: true });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Notification.updateMany({ userId: user._id, readStatus: false }, { readStatus: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const subscribeToPush = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const subscription = req.body;
    
    const user = await User.findOneAndUpdate(
      { clerkId },
      { pushSubscription: subscription },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'Push subscription saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  subscribeToPush
};
