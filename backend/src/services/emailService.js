const { BrevoClient } = require('@getbrevo/brevo');
const googleTTS = require('google-tts-api');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Configure Brevo API client
const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const getAudioData = async (text, lang) => {
  try {
    const url = googleTTS.getAudioUrl(text, { lang, slow: false, host: 'https://translate.google.com' });
    const base64 = await googleTTS.getAudioBase64(text, { lang, slow: false });
    return { url, base64 };
  } catch (error) {
    console.error(`Error generating TTS for ${lang}:`, error);
    return { url: '', base64: null };
  }
};

const sendMedicineAddedEmail = async (userId, medicineDetails) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    const times = (medicineDetails.reminderTimes || []).join(', ') || 'Not set';
    const timesRows = (medicineDetails.reminderTimes || []).map((t, i) =>
      `<tr style="background-color:${i % 2 === 0 ? '#f3f4ff' : 'white'};"><td style="padding:10px; font-weight:bold; color:#4F46E5;">Reminder ${i + 1} / రిమైండర్ ${i + 1}</td><td style="padding:10px; font-weight:bold; font-size:18px;">${t}</td></tr>`
    ).join('');

    const enText = `A new medicine ${medicineDetails.name} has been added to your profile. Dosage is ${medicineDetails.dosage}. You need to take it at ${times}.`;
    const teText = `మీ ప్రొఫైల్‌కి కొత్త మందు ${medicineDetails.name} జోడించబడింది. మోతాదు ${medicineDetails.dosage}. మీరు దీన్ని ${times} సమయానికి తీసుకోవాలి.`;
    
    const enAudio = await getAudioData(enText, 'en');
    await new Promise(resolve => setTimeout(resolve, 2500)); // Increased delay to prevent rate limits
    const teAudio = await getAudioData(teText, 'te');

    const today = new Date().toISOString().split('T')[0];
    const firstTime = (medicineDetails.reminderTimes && medicineDetails.reminderTimes[0]) || '12:00';
    const markTakenUrl = `${BACKEND_URL}/api/medicines/${medicineDetails._id}/take-email?date=${today}&time=${firstTime}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
          <div style="text-align:center; margin-bottom: 24px;">
            <h1 style="color: #4F46E5; margin:0;">&#128138; MediCare</h1>
          </div>
          
          <!-- Voice Record -->
          <div style="background: #f3f4ff; border-radius: 10px; padding: 20px; margin-bottom: 20px; text-align: center; border: 2px solid #4F46E5;">
            <h3 style="margin: 0 0 10px 0; color: #111;">&#127908; Voice Record / వాయిస్ రికార్డ్</h3>
            <p style="color: #555; margin: 0 0 4px 0; font-size: 14px;">MP3 voice files are attached at the bottom of this email.</p>
            <p style="color: #555; margin: 0; font-size: 14px;">ఈ ఇమెయిల్ చివరలో MP3 వాయిస్ ఫైల్స్ జత చేయబడ్డాయి.</p>
          </div>

          <h2 style="color: #111; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">New Medicine Added &#10003;<br><span style="font-size: 18px; color: #6D28D9;">కొత్త మందు జోడించబడింది</span></h2>
          <p style="color: #555;">Hello <strong>${user.name}</strong>, a new medicine has been added to your MediCare profile.</p>
          <p style="color: #555;">నమస్కారం <strong>${user.name}</strong>, మీ ప్రొఫైల్‌కి కొత్త మందు జోడించబడింది.</p>

          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="background-color: #f3f4ff;"><td style="padding: 10px; font-weight: bold; color:#4F46E5;">Name / పేరు</td><td style="padding: 10px; font-weight:bold; font-size:17px;">${medicineDetails.name}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold; color:#4F46E5;">Dosage / మోతాదు</td><td style="padding: 10px;">${medicineDetails.dosage}</td></tr>
            <tr style="background-color: #f3f4ff;"><td style="padding: 10px; font-weight: bold; color:#4F46E5;">Frequency / ఎన్నిసార్లు</td><td style="padding: 10px;">${medicineDetails.frequency}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold; color:#4F46E5;">Start Date / ప్రారంభ తేదీ</td><td style="padding: 10px;">${new Date(medicineDetails.startDate).toDateString()}</td></tr>
          </table>

          <div style="background:#f3f4ff; border-radius:10px; padding:16px; margin:16px 0; border-left:4px solid #4F46E5;">
            <h3 style="color:#4F46E5; margin:0 0 12px 0; font-size:15px;">&#8987; Reminder Times / మందు వేసుకునే సమయాలు</h3>
            <table style="width:100%; border-collapse:collapse;">
              ${timesRows || '<tr><td style="padding:10px; color:#888;">No times set / సమయం పెట్టలేదు</td></tr>'}
            </table>
          </div>

          <div style="text-align:center; margin-top: 28px; margin-bottom: 20px;">
            <a href="${markTakenUrl}" style="display:inline-block; background-color:#4F46E5; color:white; padding:16px 36px; border-radius:10px; font-size:16px; font-weight:bold; text-decoration:none; box-shadow:0 4px 12px rgba(79,70,229,0.3);">
              &#10003;&nbsp; Mark as Taken / వేసుకున్నాను
            </a>
          </div>

          <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 24px;">MediCare Reminder - Stay healthy! / ఆరోగ్యంగా ఉండండి!</p>
        </div>
      </body>
      </html>
    `;

    const attachments = [];
    if (enAudio.base64) attachments.push({ content: enAudio.base64, name: 'Confirmation_English.mp3' });
    if (teAudio.base64) attachments.push({ content: teAudio.base64, name: 'Confirmation_Telugu.mp3' });

    const emailData = {
      subject: 'కొత్త మందు జోడించబడింది (New Medicine Added) - MediCare',
      htmlContent: emailHtml,
      sender: { name: 'MediCare Reminder', email: 'deekshitpakalapati@gmail.com' },
      to: [{ email: user.email, name: user.name }]
    };
    if (attachments.length > 0) emailData.attachment = attachments;

    await brevo.transactionalEmails.sendTransacEmail(emailData);

    await Notification.create({
      userId: user._id,
      message: `Medicine ${medicineDetails.name} has been added.`,
      type: 'Alert'
    });

    console.log(`Medicine added email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending medicine added email:', error.message || error);
  }
};

const sendMedicineReminderEmail = async (userId, medicineDetails, dateString, currentTime) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    const enText = `Hello ${user.name}. It is time to take your medicine. Please take ${medicineDetails.name} now. Dosage is ${medicineDetails.dosage}.`;
    const teText = `నమస్కారం ${user.name}. మీ మందు వేసుకునే సమయం వచ్చింది. దయచేసి ఇప్పుడు మీ ${medicineDetails.name} తీసుకోండి. మోతాదు ${medicineDetails.dosage}.`;
    
    const enAudio = await getAudioData(enText, 'en');
    await new Promise(resolve => setTimeout(resolve, 2500)); // Increased delay to prevent rate limits
    const teAudio = await getAudioData(teText, 'te');

    const markTakenUrl = `${BACKEND_URL}/api/medicines/${medicineDetails._id}/take-email?date=${dateString}&time=${currentTime}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
          <div style="text-align:center; margin-bottom: 24px;">
            <h1 style="color: #10B981; margin:0;">&#128138; MediCare</h1>
          </div>
          
          <!-- Voice Record -->
          <div style="background: #f0fdf4; border-radius: 10px; padding: 20px; margin-bottom: 20px; text-align: center; border: 2px solid #10B981;">
            <h3 style="margin: 0 0 10px 0; color: #111;">&#127908; Voice Record / వాయిస్ రికార్డ్</h3>
            <p style="color: #555; margin: 0 0 4px 0; font-size: 14px;">MP3 voice files are attached at the bottom of this email.</p>
            <p style="color: #555; margin: 0; font-size: 14px;">ఈ ఇమెయిల్ చివరలో MP3 వాయిస్ ఫైల్స్ జత చేయబడ్డాయి.</p>
          </div>

          <h2 style="color: #111; border-bottom: 2px solid #10B981; padding-bottom: 10px;">Time for Your Medication! <br><span style="font-size: 18px; color: #059669;">మీ మందు వేసుకునే సమయం!</span></h2>
          <p style="color: #555;">Hello <strong>${user.name}</strong>, it is time to take your medication right now.</p>
          <p style="color: #555;">నమస్కారం <strong>${user.name}</strong>, మీ మందు వేసుకునే సమయం వచ్చింది. దయచేసి తీసుకోండి.</p>

          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="background-color: #f0fdf4;"><td style="padding: 10px; font-weight: bold; color:#10B981;">Medicine / మందు పేరు</td><td style="padding: 10px; font-size: 18px; font-weight: bold;">${medicineDetails.name}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold; color:#10B981;">Dosage / మోతాదు</td><td style="padding: 10px;">${medicineDetails.dosage}</td></tr>
            <tr style="background-color: #f0fdf4;"><td style="padding: 10px; font-weight: bold; color:#10B981;">Notes / సూచనలు</td><td style="padding: 10px;">${medicineDetails.notes || 'None / ఏమీ లేవు'}</td></tr>
          </table>

          <div style="text-align:center; margin-top: 28px; margin-bottom: 20px;">
            <a href="${markTakenUrl}" style="display:inline-block; background-color:#10B981; color:white; padding:16px 36px; border-radius:10px; font-size:16px; font-weight:bold; text-decoration:none; box-shadow:0 4px 12px rgba(16,185,129,0.3);">
              &#10003;&nbsp; Mark as Taken / వేసుకున్నాను
            </a>
          </div>

          <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 24px;">MediCare Reminder - Stay healthy! / ఆరోగ్యంగా ఉండండి!</p>
        </div>
      </body>
      </html>
    `;

    const attachments = [];
    if (enAudio.base64) attachments.push({ content: enAudio.base64, name: 'Reminder_English.mp3' });
    if (teAudio.base64) attachments.push({ content: teAudio.base64, name: 'Reminder_Telugu.mp3' });

    const emailData = {
      subject: 'మీ మందు వేసుకునే సమయం! (Medicine Reminder) - MediCare',
      htmlContent: emailHtml,
      sender: { name: 'MediCare Reminder', email: 'deekshitpakalapati@gmail.com' },
      to: [{ email: user.email, name: user.name }]
    };
    if (attachments.length > 0) emailData.attachment = attachments;

    await brevo.transactionalEmails.sendTransacEmail(emailData);

    await Notification.create({
      userId: user._id,
      message: `Reminder: It is time to take ${medicineDetails.name}.`,
      type: 'Alert'
    });

    console.log(`Medicine reminder email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending medicine reminder email:', error.message || error);
  }
};

module.exports = {
  sendMedicineAddedEmail,
  sendMedicineReminderEmail
};
