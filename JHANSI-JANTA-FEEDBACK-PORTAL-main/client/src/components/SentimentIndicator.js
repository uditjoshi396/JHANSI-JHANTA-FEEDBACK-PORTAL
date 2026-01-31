import React from 'react';
import { motion } from 'framer-motion';
import { Smile, Meh, Frown, Heart, AlertTriangle } from 'lucide-react';

const SentimentIndicator = ({ score, showDetails = false }) => {
  // Convert score (-1 to 1) to sentiment category
  const getSentimentData = (score) => {
    if (score >= 0.6) return { label: 'Very Positive', color: '#28a745', icon: Heart, bgColor: 'rgba(40, 167, 69, 0.1)' };
    if (score >= 0.2) return { label: 'Positive', color: '#20c997', icon: Smile, bgColor: 'rgba(32, 201, 151, 0.1)' };
    if (score >= -0.2) return { label: 'Neutral', color: '#ffc107', icon: Meh, bgColor: 'rgba(255, 193, 7, 0.1)' };
    if (score >= -0.6) return { label: 'Negative', color: '#fd7e14', icon: Frown, bgColor: 'rgba(253, 126, 20, 0.1)' };
    return { label: 'Very Negative', color: '#dc3545', icon: AlertTriangle, bgColor: 'rgba(220, 53, 69, 0.1)' };
  };

  const sentiment = getSentimentData(score);
  const IconComponent = sentiment.icon;

  return (
    <motion.div
      className="sentiment-indicator"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="sentiment-badge"
        style={{
          backgroundColor: sentiment.bgColor,
          borderColor: sentiment.color,
          color: sentiment.color
        }}
      >
        <IconComponent size={16} />
        <span className="sentiment-label">{sentiment.label}</span>
        {showDetails && (
          <span className="sentiment-score">
            ({score > 0 ? '+' : ''}{score.toFixed(2)})
          </span>
        )}
      </div>

      {/* Progress bar visualization */}
      <div className="sentiment-bar">
        <div className="sentiment-bar-bg">
          <motion.div
            className="sentiment-bar-fill"
            style={{ backgroundColor: sentiment.color }}
            initial={{ width: '50%' }}
            animate={{ width: `${((score + 1) / 2) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="sentiment-scale">
          <span>Negative</span>
          <span>Neutral</span>
          <span>Positive</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SentimentIndicator;
