import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import VoiceInput from '../components/VoiceInput';
import SentimentIndicator from '../components/SentimentIndicator';

export default function EasySubmission() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'Low'
  });
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [sentimentScore, setSentimentScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Simulate AI analysis
    if (name === 'description' && value.length > 10) {
      analyzeContent(value);
    }
  };

  const handleVoiceInput = (transcript) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description + ' ' + transcript
    }));
    analyzeContent(formData.description + ' ' + transcript);
  };

  const analyzeContent = async (content) => {
    setIsAnalyzing(true);
    // Simulate AI analysis delay
    setTimeout(() => {
      const mockSuggestions = [
        "Consider adding specific location details",
        "Include timeline of the issue",
        "Mention any previous attempts to resolve"
      ];
      setAiSuggestions(mockSuggestions);

      // Mock sentiment analysis (random for demo)
      const mockSentiment = (Math.random() - 0.5) * 2; // -1 to 1
      setSentimentScore(mockSentiment);

      setIsAnalyzing(false);
    }, 1000);
  };

  const getAISuggestions = () => {
    if (formData.description.length < 20) {
      return ["Please provide more details about your grievance"];
    }
    return aiSuggestions;
  };

  return (
    <div>
      <Navigation variant="default" />
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="section-header">
          <h1>📝 Easy Submission</h1>
          <p className="section-subtitle">
            Try our interactive form with AI assistance and voice input.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
          {/* Demo Form */}
          <div className="feature-card">
            <h3>Interactive Demo Form</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Brief title..."
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Description
                  <VoiceInput onTranscript={handleVoiceInput} placeholder="Voice input available" />
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your grievance..."
                  rows={4}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="General">General</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* AI Analysis Panel */}
          <div>
            <div className="feature-card">
              <h3>🤖 AI Analysis</h3>
              {formData.description && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4>Sentiment Analysis</h4>
                  <SentimentIndicator score={sentimentScore} showDetails={true} />
                </div>
              )}

              <div>
                <h4>AI Suggestions</h4>
                {isAnalyzing ? (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div className="spinner" style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid #f3f3f3', borderTop: '2px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p>Analyzing your input...</p>
                  </div>
                ) : (
                  <ul style={{ paddingLeft: '1.5rem' }}>
                    {getAISuggestions().map((suggestion, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem', color: '#667eea' }}>
                        💡 {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="feature-card" style={{ marginTop: '1rem' }}>
              <h3>✨ Smart Features</h3>
              <ul>
                <li>✅ Real-time validation</li>
                <li>🎙️ Voice input support</li>
                <li>🧠 AI-powered suggestions</li>
                <li>📊 Sentiment analysis</li>
                <li>💾 Auto-save drafts</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/register" className="btn btn-primary">Start Using Easy Submission</Link>
        </div>
      </div>
    </div>
  );
}
