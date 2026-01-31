const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Simple in-memory cache for chatbot responses
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class CacheEntry {
  constructor(data, ttl = CACHE_TTL) {
    this.data = data;
    this.expires = Date.now() + ttl;
  }

  isExpired() {
    return Date.now() > this.expires;
  }
}

class AIService {
  // Analyze sentiment of grievance text
  async analyzeSentiment(text) {
    if (!openai) return { score: 0, explanation: 'AI service unavailable' };
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Analyze the sentiment of this grievance text and return a score from -1 (very negative) to 1 (very positive). Also provide a brief explanation. Return as JSON: {score: number, explanation: string}"
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        score: Math.max(-1, Math.min(1, result.score)), // Clamp between -1 and 1
        explanation: result.explanation
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { score: 0, explanation: 'Analysis unavailable' };
    }
  }

  // Suggest category based on grievance content
  async suggestCategory(title, description) {
    if (!openai) return { category: 'General', confidence: 0.5, explanation: 'AI service unavailable' };
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Based on the grievance title and description, suggest the most appropriate category from: Infrastructure, Health, Education, Environment, General, Other. Return as JSON: {category: string, confidence: number, explanation: string}"
          },
          {
            role: "user",
            content: `Title: ${title}\nDescription: ${description}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result;
    } catch (error) {
      console.error('Category suggestion error:', error);
      return { category: 'General', confidence: 0.5, explanation: 'Default category' };
    }
  }

  // Suggest priority based on content and sentiment
  async suggestPriority(title, description, sentimentScore) {
    if (!openai) return { priority: 'Medium', reasoning: 'AI service unavailable' };
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Based on the grievance content and sentiment score (-1 to 1), suggest priority: Low, Medium, High, or Urgent. Consider urgency indicators, impact level, and emotional intensity. Return as JSON: {priority: string, reasoning: string}"
          },
          {
            role: "user",
            content: `Title: ${title}\nDescription: ${description}\nSentiment Score: ${sentimentScore}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result;
    } catch (error) {
      console.error('Priority suggestion error:', error);
      return { priority: 'Medium', reasoning: 'Default priority' };
    }
  }

  // Generate improvement suggestions for grievance
  async generateSuggestions(title, description) {
    if (!openai) return [];
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Provide 2-3 specific suggestions to improve this grievance submission. Focus on clarity, additional details needed, and how to make it more actionable. Return as JSON array of strings."
          },
          {
            role: "user",
            content: `Title: ${title}\nDescription: ${description}`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      });

      const suggestions = JSON.parse(response.choices[0].message.content);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
      console.error('Suggestion generation error:', error);
      return [];
    }
  }

  // Generate AI response draft for officers
  async generateResponse(title, description, category, priority) {
    if (!openai) return 'Thank you for bringing this to our attention. We are reviewing your grievance and will respond shortly.';
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Generate a professional, empathetic response draft for this grievance. Include acknowledgment, next steps, and timeline. Keep it under 200 words. Be helpful and solution-oriented."
          },
          {
            role: "user",
            content: `Category: ${category}\nPriority: ${priority}\nTitle: ${title}\nDescription: ${description}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Response generation error:', error);
      return 'Thank you for bringing this to our attention. We are reviewing your grievance and will respond shortly.';
    }
  }

  // Get cached response or null if not found/expired
  getCachedResponse(key) {
    const entry = responseCache.get(key);
    if (entry && !entry.isExpired()) {
      return entry.data;
    }
    if (entry) {
      responseCache.delete(key); // Remove expired entry
    }
    return null;
  }

  // Cache a response
  setCachedResponse(key, data) {
    responseCache.set(key, new CacheEntry(data));
  }

  // Generate cache key from message and context
  generateCacheKey(message, context) {
    const contextStr = context.slice(-3).map(m => `${m.role}:${m.content}`).join('|');
    return `${message}|${contextStr}`.toLowerCase().slice(0, 200); // Limit key length
  }

  // Get immediate fallback responses for common queries
  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('status') || lowerMessage.includes('check') || lowerMessage.includes('update')) {
      return "You can check your grievance status in the Dashboard. Look for your submitted grievances and their current status. If you need help, contact support.";
    }

    if (lowerMessage.includes('submit') || lowerMessage.includes('create') || lowerMessage.includes('new')) {
      return "To submit a new grievance, go to the Dashboard and click 'Submit New Grievance'. Provide clear details about your issue for faster resolution.";
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('guide')) {
      return "I'm here to help! You can submit grievances, track their status, and get AI-powered suggestions. What specific assistance do you need?";
    }

    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('phone')) {
      return "For urgent issues, contact our support team at support@janata.gov.in or call our helpline. We're here to help!";
    }

    // New edge case fallbacks
    if (lowerMessage.includes('login') || lowerMessage.includes('password') || lowerMessage.includes('forgot')) {
      return "For login issues, use the 'Forgot Password' link on the login page. If you're still having trouble, contact support@janata.gov.in.";
    }

    if (lowerMessage.includes('escalate') || lowerMessage.includes('urgent') || lowerMessage.includes('priority')) {
      return "For urgent grievances, mark them as high priority during submission or contact our escalation team at urgent@janata.gov.in.";
    }

    if (lowerMessage.includes('infrastructure') || lowerMessage.includes('roads') || lowerMessage.includes('water') || lowerMessage.includes('electricity')) {
      return "For infrastructure issues, submit under the 'Infrastructure' category with specific location details and photos if possible.";
    }

    if (lowerMessage.includes('health') || lowerMessage.includes('medical') || lowerMessage.includes('hospital')) {
      return "Health-related grievances should be submitted under the 'Health' category. Include medical details and facility information.";
    }

    if (lowerMessage.includes('feedback') || lowerMessage.includes('suggestion') || lowerMessage.includes('improve')) {
      return "We value your feedback! Submit portal suggestions under the 'General' category or email feedback@janata.gov.in.";
    }

    if (lowerMessage.includes('account') || lowerMessage.includes('profile') || lowerMessage.includes('settings')) {
      return "Manage your account settings in the Dashboard. You can update your profile information and notification preferences there.";
    }

    if (lowerMessage.includes('technical') || lowerMessage.includes('error') || lowerMessage.includes('bug') || lowerMessage.includes('not working')) {
      return "For technical issues, try refreshing the page or clearing your browser cache. If problems persist, contact techsupport@janata.gov.in.";
    }

    if (lowerMessage.includes('delete') || lowerMessage.includes('remove') || lowerMessage.includes('cancel')) {
      return "Grievances cannot be deleted once submitted, but you can request updates or closures. Contact support for assistance.";
    }

    return null; // No fallback available
  }

  // Chatbot response for user queries with optimization
  async getChatbotResponse(userMessage, context = []) {
    // Check cache first
    const cacheKey = this.generateCacheKey(userMessage, context);
    const cachedResponse = this.getCachedResponse(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try fallback for immediate response
    const fallback = this.getFallbackResponse(userMessage);
    if (fallback) {
      this.setCachedResponse(cacheKey, fallback);
      return fallback;
    }

    if (!openai) return "I'm sorry, I'm having trouble responding right now. Please try again or contact our support team.";

    try {
      const messages = [
        {
          role: "system",
          content: "You are a helpful AI assistant for the Janata Feedback Portal. Provide FAST, actionable solutions and immediate help. Focus on: grievance submission guidance, status checking, quick fixes, and direct support. Be concise but helpful. Prioritize real-time solutions over conversation."
        },
        ...context.slice(-3), // Reduced context for speed
        {
          role: "user",
          content: userMessage
        }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Faster model
        messages,
        max_tokens: 150, // Shorter responses
        temperature: 0.3 // More consistent responses
      });

      const aiResponse = response.choices[0].message.content.trim();

      // Cache the response
      this.setCachedResponse(cacheKey, aiResponse);

      return aiResponse;
    } catch (error) {
      console.error('Chatbot response error:', error);
      return "I'm sorry, I'm having trouble responding right now. Please try again or contact our support team.";
    }
  }
}

module.exports = new AIService();
