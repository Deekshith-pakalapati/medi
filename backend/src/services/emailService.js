const { Resend } = require('resend');
const Notification = require('../models/Notification');
const User = require('../models/User');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMedicineAddedEmail = async (userId, medicineDetails) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    const emailHtml = `
      <h2>New Medicine Added</h2>
      <p>A new medicine has been added to your MediCare profile.</p>
      <ul>
        <li><strong>Name:</strong> ${medicineDetails.name}</li>
        <li><strong>Dosage:</strong> ${medicineDetails.dosage}</li>
        <li><strong>Frequency:</strong> ${medicineDetails.frequency}</li>
        <li><strong>Start Date:</strong> ${new Date(medicineDetails.startDate).toDateString()}</li>
      </ul>
      <p>Log in to MediCare Reminder to view full details.</p>
    `;

    // Resend free tier restriction: must use onboarding@resend.dev as sender
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: user.email,
      subject: 'New Medicine Added - MediCare',
      html: emailHtml
    });

    // Save notification to MongoDB
    await Notification.create({
      userId: user._id,
      message: `Medicine ${medicineDetails.name} has been added.`,
      type: 'Alert'
    });

    console.log(`Medicine added email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending medicine added email:', error);
  }
};

const sendMedicineReminderEmail = async (userId, medicineDetails) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    const emailHtml = `
      <h2>Time for Medication!</h2>
      <p>Hello ${user.name}, it is time to take your medication.</p>
      <ul>
        <li><strong>Medicine Name:</strong> ${medicineDetails.name}</li>
        <li><strong>Dosage:</strong> ${medicineDetails.dosage}</li>
        <li><strong>Notes:</strong> ${medicineDetails.notes || 'None'}</li>
      </ul>
      <p>Please log in to your MediCare app to mark it as taken.</p>
    `;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: user.email,
      subject: 'Medication Reminder - MediCare',
      html: emailHtml
    });

    // Save notification to MongoDB
    await Notification.create({
      userId: user._id,
      message: `Reminder: It is time to take ${medicineDetails.name}.`,
      type: 'Alert'
    });

    console.log(`Medicine reminder email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending medicine reminder email:', error);
  }
};

module.exports = {
  sendMedicineAddedEmail,
  sendMedicineReminderEmail
};
