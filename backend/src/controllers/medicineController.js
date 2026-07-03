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

// Delete medicine
const deleteMedicine = async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark medicine as taken (authenticated API)
const markTaken = async (req, res) => {
  try {
    const { date, time } = req.body;
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    
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

// Mark medicine as taken from email (GET, no auth) - auto-close success page
const markTakenFromEmail = async (req, res) => {
  try {
    const { date, time } = req.query;
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.send('<h2 style="font-family:Arial;text-align:center;padding:40px;color:red;">Medicine not found.</h2>');
    }
    
    const alreadyTaken = medicine.takenLogs.some(log => log.date === date && log.time === time);
    if (!alreadyTaken) {
      medicine.takenLogs.push({ date, time });
      await medicine.save();
    }
    
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Medicine Taken - MediCare</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
    }
    .card {
      background: white;
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 440px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(16,185,129,0.15);
      animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes popIn {
      from { opacity:0; transform:scale(0.8); }
      to { opacity:1; transform:scale(1); }
    }
    .icon {
      width: 90px; height: 90px;
      background: linear-gradient(135deg, #10B981, #059669);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      font-size: 44px;
      box-shadow: 0 8px 24px rgba(16,185,129,0.35);
      animation: bounce 0.6s ease 0.3s both;
    }
    @keyframes bounce {
      from { transform:scale(0); }
      60% { transform:scale(1.2); }
      to { transform:scale(1); }
    }
    h1 { color:#059669; font-size:28px; font-weight:800; margin-bottom:8px; }
    .te { color:#047857; font-size:20px; font-weight:700; margin-bottom:16px; }
    .medicine-name {
      background:#f0fdf4;
      border:2px solid #10B981;
      border-radius:12px;
      padding:14px 20px;
      margin:16px 0;
      font-size:20px;
      font-weight:800;
      color:#065f46;
    }
    p { color:#6b7280; font-size:14px; margin-top:8px; }
    .footer { color:#d1d5db; font-size:13px; margin-top:28px; }
    .countdown { color:#10B981; font-weight:bold; }
    .progress-bar {
      width:100%; height:4px;
      background:#e5e7eb;
      border-radius:99px;
      margin-top:24px;
      overflow:hidden;
    }
    .progress-fill {
      height:100%;
      background:linear-gradient(90deg,#10B981,#059669);
      border-radius:99px;
      animation:shrink 2s linear forwards;
    }
    @keyframes shrink {
      from { width:100%; }
      to { width:0%; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">&#10003;</div>
    <h1>Medicine Taken!</h1>
    <div class="te">మందు వేసుకున్నారు! &#128138;</div>
    <div class="medicine-name">${medicine.name}</div>
    <p>&#10003; Successfully recorded. Stay healthy!</p>
    <p>&#10003; విజయవంతంగా నమోదు చేయబడింది. ఆరోగ్యంగా ఉండండి!</p>
    <div class="progress-bar"><div class="progress-fill"></div></div>
    <p class="footer">This window closes in <span class="countdown" id="cd">2</span>s...</p>
  </div>
  <script>
    let t = 2;
    const cd = document.getElementById('cd');
    const iv = setInterval(function() {
      t--;
      cd.textContent = t;
      if (t <= 0) { clearInterval(iv); window.close(); }
    }, 1000);
  </script>
</body>
</html>`);
  } catch (error) {
    res.send('<h2 style="font-family:Arial;text-align:center;padding:40px;">Error marking medicine as taken.</h2>');
  }
};

module.exports = {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  markTaken,
  markTakenFromEmail
};
