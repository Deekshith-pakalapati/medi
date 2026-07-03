const Groq = require('groq-sdk');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const Medicine = require('../models/Medicine');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const clerkId = req.auth.userId;
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch user's medicines for context
    let parentId = user._id;
    if (user.role === 'Mentee' && user.linkedParentId) {
      parentId = user.linkedParentId;
    }
    const medicines = await Medicine.find({ parentId, status: 'Active' });
    const medsContext = medicines.map(m => `${m.name} (${m.dosage}) at ${m.reminderTimes.join(', ')}`).join('; ');

    const systemPrompt = `You are MediCare Assistant, an AI designed to help elderly people and their caregivers with medication adherence.
    The current user is a ${user.role} named ${user.name}. 
    Active medicines for this account: ${medsContext || 'None currently listed'}.
    Keep answers concise, friendly, and helpful. Do not prescribe medicines.`;

    // Fetch recent history for context
    const recentHistory = await ChatMessage.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10);
    const formattedHistory = recentHistory.reverse().flatMap(msg => [
      { role: 'user', content: msg.message },
      { role: 'assistant', content: msg.aiResponse }
    ]);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: message }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 500
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";

    // Save chat history
    const chatMsg = new ChatMessage({
      userId: user._id,
      message,
      aiResponse
    });
    await chatMsg.save();

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error('Groq Error:', error);
    res.status(500).json({ message: 'Failed to communicate with AI Assistant.' });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const history = await ChatMessage.find({ userId: user._id }).sort({ createdAt: 1 }).limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearChatHistory = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await ChatMessage.deleteMany({ userId: user._id });
    res.json({ message: 'Chat cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { chat, getChatHistory, clearChatHistory };
