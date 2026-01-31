import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

// Fallback responses for immediate replies when API is slow
const getFallbackResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('status') || lowerMessage.includes('check') || lowerMessage.includes('update')) {
    return "You can check your grievance status in the Dashboard. Look for your submitted grievances and their current status.";
  }

  if (lowerMessage.includes('submit') || lowerMessage.includes('create') || lowerMessage.includes('new')) {
    return "To submit a new grievance, go to the Dashboard and click 'Submit New Grievance'. Provide clear details for faster resolution.";
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('guide')) {
    return "I'm here to help! You can submit grievances, track their status, and get AI-powered suggestions.";
  }

  if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('phone')) {
    return "For urgent issues, contact our support team at support@janata.gov.in or call our helpline.";
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

  return null;
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant for the Janata Feedback Portal. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: "Please log in to use the AI assistant.",
          sender: 'bot',
          timestamp: new Date()
        }]);
        setIsTyping(false);
        return;
      }

      // Reduced context for faster responses
      const response = await axios.post('http://localhost:5000/api/grievances/chatbot', {
        message: inputMessage,
        context: messages.slice(-3).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }))
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout for faster perceived response
      });

      const botMessage = {
        id: messages.length + 2,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      // Provide immediate fallback response
      const fallbackMessage = getFallbackResponse(inputMessage);
      setMessages(prev => [...prev, {
        id: messages.length + 2,
        text: fallbackMessage || "I'm sorry, I'm having trouble responding right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        className="ai-chatbot-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-chatbot-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="ai-chatbot-header">
              <div className="ai-chatbot-header-content">
                <div className="ai-chatbot-avatar">
                  <Bot size={20} />
                  <Sparkles size={12} className="ai-sparkle" />
                </div>
                <div>
                  <h4>AI Assistant</h4>
                  <p>Powered by AI</p>
                </div>
              </div>
              <button
                className="ai-chatbot-close"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="ai-chatbot-messages">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`ai-message ${message.sender === 'user' ? 'user' : 'bot'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="ai-message-avatar">
                    {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className="ai-message-content">
                    <p>{message.text}</p>
                    <span className="ai-message-time">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  className="ai-message bot"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="ai-message-avatar">
                    <Bot size={16} />
                  </div>
                  <div className="ai-message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="ai-chatbot-input">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="ai-send-button"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
