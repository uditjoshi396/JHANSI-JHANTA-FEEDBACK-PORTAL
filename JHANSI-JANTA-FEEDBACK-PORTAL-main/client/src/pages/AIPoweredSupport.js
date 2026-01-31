import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

export default function AIPoweredSupport() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you with your grievance today?", sender: 'ai', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sentimentScore, setSentimentScore] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const analyzeSentiment = (text) => {
    // Mock sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'thank', 'please', 'help'];
    const negativeWords = ['bad', 'terrible', 'awful', 'angry', 'frustrated', 'hate', 'problem', 'issue', 'broken'];

    const words = text.toLowerCase().split(' ');
    let score = 0;

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) score += 0.2;
      if (negativeWords.some(nw => word.includes(nw))) score -= 0.2;
    });

    return Math.max(-1, Math.min(1, score));
  };

  const getAISuggestions = (userMessage) => {
    const suggestions = {
      'street light': ['Please provide the exact location and street name', 'Include how long the issue has been occurring', 'Mention if this affects safety'],
      'water': ['Specify if it\'s drinking water or sewage', 'Include your area pincode', 'Mention duration of the problem'],
      'road': ['Provide exact location and landmarks', 'Include photos if possible', 'Mention traffic impact'],
      'electricity': ['Specify the type of electrical issue', 'Include your consumer number if available', 'Mention duration and frequency']
    };

    for (const [key, value] of Object.entries(suggestions)) {
      if (userMessage.toLowerCase().includes(key)) {
        return value;
      }
    }

    return ['Please provide more specific details about your issue', 'Include location information', 'Mention when the problem started'];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { id: Date.now(), text: inputMessage, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Analyze sentiment
    const sentiment = analyzeSentiment(inputMessage);
    setSentimentScore(sentiment);

    // Immediate AI response (no artificial delay)
    const suggestions = getAISuggestions(inputMessage);
    const aiResponse = {
      id: Date.now() + 1,
      text: `Thank you for sharing that. Based on your message, here are some suggestions to help resolve your issue faster:\n\n${suggestions.map(s => `• ${s}`).join('\n')}\n\nWould you like me to help you draft a formal grievance?`,
      sender: 'ai',
      timestamp: new Date(),
      suggestions: suggestions
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSentimentColor = (score) => {
    if (score > 0.2) return '#28a745';
    if (score < -0.2) return '#dc3545';
    return '#ffc107';
  };

  const getSentimentLabel = (score) => {
    if (score > 0.2) return 'Positive';
    if (score < -0.2) return 'Negative';
    return 'Neutral';
  };

  return (
    <div>
      <Navigation variant="default" />
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="section-header">
          <h1>🤖 AI-Powered Support</h1>
          <p className="section-subtitle">
            Experience intelligent assistance with real-time sentiment analysis and smart suggestions.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
          {/* Sentiment Analysis Panel */}
          <div className="feature-card">
            <h3>📊 Real-Time Analysis</h3>

            <div style={{ marginBottom: '1rem' }}>
              <h4>Sentiment Score</h4>
              <div style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#e9ecef',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  width: `${((sentimentScore + 1) / 2) * 100}%`,
                  height: '100%',
                  backgroundColor: getSentimentColor(sentimentScore),
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
              <div style={{ textAlign: 'center', fontWeight: 'bold', color: getSentimentColor(sentimentScore) }}>
                {getSentimentLabel(sentimentScore)} ({sentimentScore.toFixed(2)})
              </div>
            </div>

            <div>
              <h4>AI Capabilities</h4>
              <ul>
                <li>🎭 Sentiment Analysis</li>
                <li>💡 Smart Suggestions</li>
                <li>📝 Draft Assistance</li>
                <li>🔍 Issue Categorization</li>
                <li>⏰ Priority Assessment</li>
              </ul>
            </div>
          </div>

          {/* Chat Interface */}
          <div>
            <div className="feature-card">
              <h3>💬 AI Chatbot Demo</h3>

              <div style={{
                height: '400px',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f8f9fa'
              }}>
                {/* Messages */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {messages.map(message => (
                    <div key={message.id} style={{
                      alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: message.sender === 'user' ? '#667eea' : 'white',
                      color: message.sender === 'user' ? 'white' : 'black',
                      border: message.sender === 'ai' ? '1px solid #dee2e6' : 'none',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {message.text}
                      <div style={{
                        fontSize: '0.7rem',
                        opacity: 0.7,
                        marginTop: '0.25rem'
                      }}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div style={{
                      alignSelf: 'flex-start',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      border: '1px solid #dee2e6'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="spinner" style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #f3f3f3',
                          borderTop: '2px solid #667eea',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        AI is typing...
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your grievance..."
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px'
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
                      opacity: inputMessage.trim() && !isTyping ? 1 : 0.5
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            <div className="feature-card" style={{ marginTop: '1rem' }}>
              <h3>🚀 AI Features in Action</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem' }}>🎭</div>
                  <h4>Sentiment Analysis</h4>
                  <p>Real-time emotion detection</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem' }}>💡</div>
                  <h4>Smart Suggestions</h4>
                  <p>Context-aware recommendations</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem' }}>📝</div>
                  <h4>Draft Assistance</h4>
                  <p>Help writing formal grievances</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem' }}>🔍</div>
                  <h4>Auto Categorization</h4>
                  <p>Automatic issue classification</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/register" className="btn btn-primary">Try AI Support</Link>
        </div>
      </div>
    </div>
  );
}
