const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const { sendMedicineReminderEmail } = require('./emailService');

const initCronJobs = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Get current time in HH:mm format based on local time
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;

      // Find all active medicines
      const activeMedicines = await Medicine.find({ status: 'Active' });

      for (const medicine of activeMedicines) {
        // If current time is in the reminderTimes array
        if (medicine.reminderTimes.includes(currentTime)) {
          // Check if it's already taken today at this time
          const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
          const alreadyTaken = medicine.takenLogs.some(log => log.date === dateString && log.time === currentTime);

          if (!alreadyTaken) {
            // Send reminder to the parentId user
            await sendMedicineReminderEmail(medicine.parentId, medicine);
          }
        }
      }
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });

  console.log('Cron jobs initialized');
};

module.exports = {
  initCronJobs
};
