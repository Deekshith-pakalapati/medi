const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const { sendMedicineReminderEmail } = require('./emailService');
const webPush = require('web-push');

// Configure web-push
webPush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:test@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

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
            await sendMedicineReminderEmail(medicine.parentId, medicine, dateString, currentTime);
            
            // Send push notification
            const User = require('../models/User');
            const user = await User.findById(medicine.parentId);
            if (user && user.pushSubscription) {
              const payload = JSON.stringify({
                title: 'Medicine Reminder',
                body: `It's time to take your ${medicine.name} (${medicine.dosage}).`,
                url: '/dashboard'
              });
              try {
                await webPush.sendNotification(user.pushSubscription, payload);
              } catch (pushErr) {
                console.error('Error sending push notification:', pushErr);
              }
            }
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
