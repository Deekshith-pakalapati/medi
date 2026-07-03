require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'user', content: 'hello' }
      ],
      model: 'llama-3.1-8b-instant',
    });
    console.log('Success:', chatCompletion.choices[0]?.message?.content);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
