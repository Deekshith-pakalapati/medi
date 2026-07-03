const Medicine = require('../models/Medicine');
const User = require('../models/User');
const { sendMedicineAddedEmail } = require('../services/emailService');

// Get medicines (Parent gets own, Mentee gets parent's)
const getMedicines = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let targetId = user._id;

    if (req.query.type === 'linked') {
      if (!user.linkedParentId) return res.json([]);
      targetId = user.linkedParentId;
    } else if (user.role === 'Mentee') {
      // Fallback for backwards compatibility if a Mentee calls without query param
      if (!user.linkedParentId) return res.json([]);
      targetId = user.linkedParentId;
    }

    const medicines = await Medicine.find({ parentId: targetId, status: 'Active' }).sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add medicine
const addMedicine = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let parentId = user._id;
    if (user.role === 'Mentee') {
      if (!user.linkedParentId) return res.status(400).json({ message: 'Not linked to a parent' });
      parentId = user.linkedParentId;
    }

    const newMedicine = new Medicine({
      ...req.body,
      createdBy: user._id,
      parentId
    });

    await newMedicine.save();
    
    // Trigger email notification asynchronously
    sendMedicineAddedEmail(parentId, newMedicine).catch(console.error);

    res.status(201).json(newMedicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update medicine
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete medicine (Soft delete or hard delete)
const deleteMedicine = async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark medicine as taken
const markTaken = async (req, res) => {
  try {
    const { date, time } = req.body;
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    
    // Prevent duplicate logs for the same day and time
    const alreadyTaken = medicine.takenLogs.some(log => log.date === date && log.time === time);
    if (!alreadyTaken) {
      medicine.takenLogs.push({ date, time });
      await medicine.save();
    }
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  markTaken
};
