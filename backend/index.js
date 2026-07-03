const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const { initCronJobs } = require('./src/services/cronService');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('MediCare Reminder API is running');
});

const googleTTS = require('google-tts-api');
app.get('/api/tts', async (req, res) => {
  try {
    const { text, lang } = req.query;
    if (!text || !lang) return res.status(400).send('Missing text or lang');
    const base64 = await googleTTS.getAudioBase64(text, { lang, slow: false });
    const audioBuffer = Buffer.from(base64, 'base64');
    res.set({
      'Content-Type': 'audio/mp3',
      'Content-Length': audioBuffer.length
    });
    res.end(audioBuffer);
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).send('TTS Error');
  }
});

// Import Routes
const userRoutes = require('./src/routes/userRoutes');
const medicineRoutes = require('./src/routes/medicineRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

app.use('/api/users', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initCronJobs();
});
