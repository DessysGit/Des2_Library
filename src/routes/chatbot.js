const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Library-specific knowledge base
const libraryResponses = {
  greeting: [
    "Hello! I'm LibBot, your Des2 Library assistant. How can I help you find books today?",
    "Hi there! Welcome to Des2 Library. What kind of books interest you?",
    "Hey! I'm here to help you discover great books. What are you looking for?"
  ],
  recommendation: [
    "I'd love to help! What genre interests you? We have Fiction, Mystery, Romance, Sci-Fi, Fantasy, Non-Fiction, Biography, and more!",
    "Great question! Tell me what you enjoy reading and I'll point you to our best titles in that genre.",
    "To recommend books, I need to know your preferences. What genres do you like?"
  ],
  search: [
    "You can search for books using the search bar on the main page. Enter a title, author name, or genre to find what you're looking for!",
    "Finding books is easy! Use the search filters for title, author, or genre on the books page."
  ],
  download: [
    "To download a book: 1) Click on the book to view details, 2) Click the green Download button. You must be logged in to download.",
    "Downloading is simple! Find a book you like, click on it, then click the Download button on the details page."
  ],
  genres: [
    "Our library includes: Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, Biography, History, Self-Help, and many more! Which genre would you like to explore?",
    "We have a wide variety! Popular genres include Mystery, Romance, Sci-Fi, Fantasy, Thriller, and Literary Fiction. What's your preference?"
  ],
  help: [
    "I can help you with: finding books, genre suggestions, search tips, download instructions, and general library navigation. What do you need?",
    "Ask me about book recommendations, how to search, available genres, or how to download books!"
  ]
};

// Intelligent response matcher
function getSmartResponse(message) {
  const msg = message.toLowerCase().trim();
  
  // Greeting patterns
  if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))/.test(msg)) {
    return libraryResponses.greeting[Math.floor(Math.random() * libraryResponses.greeting.length)];
  }
  
  // Recommendation patterns
  if (/(recommend|suggest|good book|what.*read|book.*for|looking for)/.test(msg)) {
    return libraryResponses.recommendation[Math.floor(Math.random() * libraryResponses.recommendation.length)];
  }
  
  // Search patterns
  if (/(how.*search|find.*book|where.*look|search.*for)/.test(msg)) {
    return libraryResponses.search[Math.floor(Math.random() * libraryResponses.search.length)];
  }
  
  // Download patterns
  if (/(download|get.*book|how.*download)/.test(msg)) {
    return libraryResponses.download[Math.floor(Math.random() * libraryResponses.download.length)];
  }
  
  // Genre patterns
  if (/(genre|category|type.*book|what.*available|sections)/.test(msg)) {
    return libraryResponses.genres[Math.floor(Math.random() * libraryResponses.genres.length)];
  }
  
  // Help patterns
  if (/(help|what.*do|how.*work|guide|assist)/.test(msg)) {
    return libraryResponses.help[Math.floor(Math.random() * libraryResponses.help.length)];
  }
  
  return null; // No pattern match, try AI
}

// Fallback responses
const fallbackResponses = [
  "I'm here to help with book recommendations and library navigation. What would you like to know?",
  "I can help you find books! Try asking about genres, search tips, or recommendations.",
  "As your library assistant, I can guide you to great books. What interests you?",
  "Let me help you explore our collection! What kind of books do you enjoy?"
];

// Chat endpoint
router.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  
  // Validation
  if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
    return res.status(400).json({ 
      reply: 'Please send a valid message.' 
    });
  }

  if (userMessage.length > 500) {
    return res.json({ 
      reply: 'Your message is too long. Please keep it under 500 characters.' 
    });
  }

  // Try smart pattern matching first
  const smartResponse = getSmartResponse(userMessage);
  if (smartResponse) {
    console.log('✅ Used smart pattern matching');
    return res.json({ reply: smartResponse });
  }

  // If no pattern match and no API key, use fallback
  if (!HUGGINGFACE_API_KEY) {
    console.log('⚠️ No API key, using fallback');
    return res.json({ 
      reply: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    });
  }

  // Try GPT-2 (most reliable free model)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const prompt = `Library Assistant helping users find books.\nUser: ${userMessage}\nAssistant:`;
    
    const response = await fetch(
      'https://api-inference.huggingface.co/models/gpt2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 50,
            temperature: 0.8,
            return_full_text: false
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        let reply = data[0].generated_text.trim();
        
        // Clean up response
        reply = reply.replace(/^(Assistant:|User:)/i, '').trim();
        reply = reply.split('\n')[0]; // Take first line only
        
        if (reply.length > 10) {
          console.log('✅ GPT-2 response');
          return res.json({ reply });
        }
      }
    } else {
      console.log(`⚠️ GPT-2 returned ${response.status}`);
    }
  } catch (error) {
    console.log('⚠️ AI request failed:', error.message);
  }

  // Final fallback
  console.log('Using fallback response');
  return res.json({ 
    reply: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
  });
});

// Health check
router.get('/chat/health', (req, res) => {
  res.json({
    status: 'ready',
    api_key_configured: !!HUGGINGFACE_API_KEY,
    mode: HUGGINGFACE_API_KEY ? 'smart_matching + ai_fallback' : 'smart_matching_only',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
