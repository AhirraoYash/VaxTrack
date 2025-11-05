require('dotenv').config();

// OpenAI client (CommonJS)
const OpenAI = require('openai').OpenAI;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log("Loaded OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Present" : "❌ Missing");


// No async init needed for OpenAI

const handleChatMessage = async (req, res) => {
  console.log("Loaded OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Present" : "❌ Missing");

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ msg: 'Message is required' });
    }

    // ✅ OpenAI chat completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message }
      ]
    });
    const aiMessage = completion.choices?.[0]?.message?.content || '';

    // ✅ Send response to frontend
    res.json({ reply: aiMessage });
  } catch (error) {
    if (error?.status === 401 || error?.code === 'invalid_api_key') {
      return res.status(401).json({ msg: 'Invalid OpenAI API key. Check OPENAI_API_KEY.' });
    }
    if (error?.status === 429 || error?.code === 'insufficient_quota') {
      return res.status(429).json({ msg: 'AI quota exceeded. Please try again later.' });
    }
    console.error('Error in chat controller:', error);
    res.status(500).send('Server Error');
  }
};

module.exports = { handleChatMessage };
