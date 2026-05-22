// React Imports
import { useEffect, useState } from 'react';

// MUI Imports
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// Third-party Imports
import classnames from 'classnames';

interface AIThinkingAnimationProps {
  className?: string;
  variant?: 'dots' | 'typing' | 'progress' | 'brain';
  stage?: 'processing' | 'analyzing' | 'generating' | 'finalizing';
}

const AIThinkingAnimation = ({ 
  className, 
  variant = 'typing',
  stage = 'processing'
}: AIThinkingAnimationProps) => {
  const [currentText, setCurrentText] = useState('');
  const [dotCount, setDotCount] = useState(0);

  const getThinkingMessages = (stage: string) => {
    switch (stage) {
      case 'processing':
        return ['Processing your request', 'Understanding your question', 'Analyzing context'];
      case 'analyzing':
        return ['Analyzing your input', 'Searching knowledge base', 'Gathering information'];
      case 'generating':
        return ['Generating response', 'Crafting answer', 'Preparing reply'];
      case 'finalizing':
        return ['Finalizing response', 'Almost ready', 'Just a moment'];
      default:
        return ['Thinking', 'Processing', 'Working on it'];
    }
  };

  const thinkingMessages = getThinkingMessages(stage);

  // Animated dots effect
  useEffect(() => {
    if (variant === 'dots') {
      const interval = setInterval(() => {
        setDotCount(prev => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [variant]);

  // Typing effect for messages
  useEffect(() => {
    if (variant === 'typing') {
      let messageIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      
      const typeInterval = setInterval(() => {
        const currentMessage = thinkingMessages[messageIndex];
        
        if (!isDeleting) {
          setCurrentText(currentMessage.substring(0, charIndex + 1));
          charIndex++;
          
          if (charIndex === currentMessage.length) {
            setTimeout(() => {
              isDeleting = true;
            }, 1500);
          }
        } else {
          setCurrentText(currentMessage.substring(0, charIndex - 1));
          charIndex--;
          
          if (charIndex === 0) {
            isDeleting = false;
            messageIndex = (messageIndex + 1) % thinkingMessages.length;
          }
        }
      }, isDeleting ? 50 : 100);
      
      return () => clearInterval(typeInterval);
    }
  }, [variant]);

  if (variant === 'dots') {
    return (
      <div className={classnames("flex items-center gap-2", className)}>
        <Typography variant="body1" className="text-gray-600">
          AI is thinking
        </Typography>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={classnames(
                "w-2 h-2 bg-green-600 rounded-full transition-opacity duration-300",
                {
                  "opacity-100": i <= dotCount,
                  "opacity-30": i > dotCount,
                }
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'typing') {
    return (
      <div className={classnames("flex items-center gap-2", className)}>
        <Typography variant="body1" className="text-gray-600 min-w-0">
          {currentText}
          <span className="animate-pulse">|</span>
        </Typography>
      </div>
    );
  }

  if (variant === 'progress') {
    return (
      <div className={classnames("flex items-center gap-3", className)}>
        <div className="flex-1">
          <Typography variant="body2" className="text-gray-600 mb-1">
            AI is processing your request...
          </Typography>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-green-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}>
              <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'brain') {
    return (
      <div className={classnames("flex items-center gap-3", className)}>
        <div className="relative">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
        </div>
        <div className="flex flex-col">
          <Typography variant="body2" className="text-gray-700 font-medium">
            AI Assistant
          </Typography>
          <div className="flex items-center gap-1">
            <Typography variant="caption" className="text-gray-500">
              Processing
            </Typography>
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AIThinkingAnimation;