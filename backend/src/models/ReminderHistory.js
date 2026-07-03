const mongoose = require('mongoose');

const reminderHistorySchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  scheduledTime: { type: Date, required: true },
  status: { type: String, enum: ['Taken', 'Missed', 'Pending'], default: 'Pending' },
  confirmationTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ReminderHistory', reminderHistorySchema);
