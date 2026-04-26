import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  Square
} from 'lucide-react';
import '../styles/AIChatbot.css';
import { API_BASE } from '../config';

const createWelcomeMessage = () => ({
  id: 'welcome',
  text: "Hello! I am your AI Copilot. I can help with grievance submission, tracking, and escalation guidance.",
  sender: 'bot',
  timestamp: new Date()
});

const DEFAULT_PROMPTS = [
  'How to submit a grievance?',
  'How to check grievance status?',
  'How to escalate urgent issue?'
];

const getFallbackResponse = (message) => {
  const m = message.toLowerCase();
  if (m.includes('submit') || m.includes('new')) {
    return "Go to Dashboard and click 'Submit New Grievance'. Add clear location and issue details.";
  }
  if (m.includes('status') || m.includes('track')) {
    return "Open Dashboard > My Grievances to check live status and recent updates.";
  }
  if (m.includes('urgent') || m.includes('escalate')) {
    return 'Mark the grievance as High priority and include impact details for faster routing.';
  }
  return 'AI service is temporarily unavailable. Please retry in a moment.';
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([createWelcomeMessage()]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [promptSuggestions, setPromptSuggestions] = useState(DEFAULT_PROMPTS);
  const [streamError, setStreamError] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const authToken = useMemo(() => localStorage.getItem('token'), []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isStreaming]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const createLocalId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const getChatContext = (nextUserMessage) => {
    const base = messages
      .filter((m) => m.sender === 'user' || m.sender === 'bot')
      .slice(-5)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

    if (nextUserMessage) {
      base.push({ role: 'user', content: nextUserMessage });
    }
    return base.slice(-6);
  };

  const ensureSession = async (token) => {
    if (sessionId) return sessionId;
    const response = await axios.post(
      `${API_BASE}/chatbot/session`,
      {},
      { headers: { Authorization: `Bearer ${token}` }, timeout: 8000 }
    );
    const nextSessionId = response.data?.sessionId || null;
    if (nextSessionId) setSessionId(nextSessionId);
    return nextSessionId;
  };

  const updateBotMessage = (messageId, patch) => {
    setMessages((prev) =>
      prev.map((item) => (item.id === messageId ? { ...item, ...patch } : item))
    );
  };

  const appendToBotMessage = (messageId, chunkText) => {
    setMessages((prev) =>
      prev.map((item) =>
        item.id === messageId ? { ...item, text: `${item.text}${chunkText}` } : item
      )
    );
  };

  const fallbackToStandardRequest = async ({
    token,
    messageText,
    botMessageId,
    activeSessionId
  }) => {
    const response = await axios.post(
      `${API_BASE}/chatbot`,
      {
        message: messageText,
        context: getChatContext(messageText),
        sessionId: activeSessionId
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 12000
      }
    );

    updateBotMessage(botMessageId, {
      text: response.data?.response || 'No response received.',
      streaming: false,
      timestamp: new Date()
    });

    if (response.data?.sessionId) setSessionId(response.data.sessionId);
    if (Array.isArray(response.data?.suggestions) && response.data.suggestions.length > 0) {
      setPromptSuggestions(response.data.suggestions.slice(0, 3));
    }
  };

  const streamRequest = async ({
    token,
    messageText,
    botMessageId,
    activeSessionId
  }) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const streamResponse = await fetch(`${API_BASE}/chatbot/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        message: messageText,
        context: getChatContext(messageText),
        sessionId: activeSessionId
      }),
      signal: controller.signal
    });

    if (!streamResponse.ok || !streamResponse.body) {
      throw new Error(`Streaming failed with status ${streamResponse.status}`);
    }

    const reader = streamResponse.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    const processEvent = (rawEvent) => {
      const lines = rawEvent.split('\n');
      let eventName = 'message';
      let data = '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          data += line.slice(5).trim();
        }
      }

      if (!data) return;
      let payload;
      try {
        payload = JSON.parse(data);
      } catch {
        return;
      }

      if (eventName === 'chunk') {
        appendToBotMessage(botMessageId, payload.text || '');
      } else if (eventName === 'done') {
        updateBotMessage(botMessageId, {
          text: payload.response || '',
          streaming: false,
          timestamp: new Date()
        });
        if (payload.sessionId) setSessionId(payload.sessionId);
        if (Array.isArray(payload.suggestions) && payload.suggestions.length > 0) {
          setPromptSuggestions(payload.suggestions.slice(0, 3));
        }
      } else if (eventName === 'error') {
        throw new Error(payload.error || 'Unknown streaming error');
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let dividerIndex = buffer.indexOf('\n\n');

      while (dividerIndex !== -1) {
        const rawEvent = buffer.slice(0, dividerIndex).trim();
        buffer = buffer.slice(dividerIndex + 2);
        if (rawEvent) processEvent(rawEvent);
        dividerIndex = buffer.indexOf('\n\n');
      }
    }
  };

  const sendMessage = async (preFilledMessage = null) => {
    const messageText = (preFilledMessage ?? inputMessage).trim();
    if (!messageText || isStreaming) return;

    setInputMessage('');
    setStreamError('');

    const userMessageId = createLocalId();
    const botMessageId = createLocalId();

    const userMessage = {
      id: userMessageId,
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    const botPlaceholder = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      streaming: true
    };

    setMessages((prev) => [...prev, userMessage, botPlaceholder]);

    if (!authToken) {
      updateBotMessage(botMessageId, {
        text: 'Please log in to use the AI Copilot.',
        streaming: false
      });
      return;
    }

    setIsTyping(true);
    setIsStreaming(true);

    try {
      const activeSessionId = await ensureSession(authToken);
      await streamRequest({
        token: authToken,
        messageText,
        botMessageId,
        activeSessionId
      });
    } catch (streamingError) {
      try {
        const activeSessionId = sessionId || (await ensureSession(authToken));
        await fallbackToStandardRequest({
          token: authToken,
          messageText,
          botMessageId,
          activeSessionId
        });
      } catch {
        updateBotMessage(botMessageId, {
          text: getFallbackResponse(messageText),
          streaming: false
        });
        setStreamError('Realtime AI temporarily unavailable. Switched to fallback response.');
      }
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsTyping(false);
  };

  const resetConversation = async () => {
    if (isStreaming) stopStreaming();
    setMessages([createWelcomeMessage()]);
    setPromptSuggestions(DEFAULT_PROMPTS);
    setStreamError('');

    if (!authToken) {
      setSessionId(null);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/chatbot/session`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` }, timeout: 8000 }
      );
      setSessionId(response.data?.sessionId || null);
    } catch {
      setSessionId(null);
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
      <motion.button
        className="ai-chatbot-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-chatbot-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="ai-chatbot-header">
              <div className="ai-chatbot-header-content">
                <div className="ai-chatbot-avatar">
                  <Bot size={20} />
                  <Sparkles size={11} className="ai-sparkle" />
                </div>
                <div>
                  <h4>AI Copilot</h4>
                  <p>{isStreaming ? 'Streaming response...' : 'Realtime assistant'}</p>
                </div>
              </div>

              <div className="ai-chatbot-controls">
                <button
                  type="button"
                  className="ai-control-btn"
                  onClick={resetConversation}
                  title="New chat"
                >
                  <RotateCcw size={16} />
                </button>
                {isStreaming && (
                  <button
                    type="button"
                    className="ai-control-btn danger"
                    onClick={stopStreaming}
                    title="Stop generation"
                  >
                    <Square size={14} />
                  </button>
                )}
                <button
                  type="button"
                  className="ai-control-btn"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {streamError && <div className="ai-chatbot-alert">{streamError}</div>}

            <div className="ai-chatbot-actions">
              {promptSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="ai-suggestion-chip"
                  onClick={() => sendMessage(prompt)}
                  disabled={isStreaming}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="ai-chatbot-messages">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`ai-message ${message.sender === 'user' ? 'user' : 'bot'}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="ai-message-avatar">
                    {message.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
                  </div>
                  <div className="ai-message-content">
                    <p>
                      {message.text}
                      {message.streaming && <span className="ai-streaming-cursor">|</span>}
                    </p>
                    <span className="ai-message-time">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isTyping && !isStreaming && (
                <motion.div className="ai-message bot" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="ai-message-avatar">
                    <Bot size={15} />
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

            <div className="ai-chatbot-input">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about grievance submission, status, escalation..."
                disabled={isStreaming}
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isStreaming}
                className="ai-send-button"
              >
                <Send size={17} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
