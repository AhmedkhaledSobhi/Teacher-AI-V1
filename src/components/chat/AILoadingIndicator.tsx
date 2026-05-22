// React Imports
import { useEffect, useState } from 'react';

// MUI Imports
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

// Third-party Imports
import classnames from 'classnames';

interface AILoadingIndicatorProps {
  className?: string;
  stage?: 'processing' | 'analyzing' | 'generating' | 'finalizing';
  showProgress?: boolean;
}

const AILoadingIndicator = ({ 
  className, 
  stage = 'processing',
  showProgress = true
}: AILoadingIndicatorProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const getStageInfo = (stage: string) => {
    switch (stage) {
      case 'processing':
        return {
          title: 'Processing Request',
          steps: ['Reading your message', 'Understanding context', 'Preparing analysis'],
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          progressColor: 'primary'
        };
      case 'analyzing':
        return {
          title: 'Analyzing Content',
          steps: ['Searching knowledge base', 'Cross-referencing information', 'Validating sources'],
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          progressColor: 'secondary'
        };
      case 'generating':
        return {
          title: 'Generating Response',
          steps: ['Structuring answer', 'Crafting explanation', 'Adding examples'],
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          progressColor: 'success'
        };
      case 'finalizing':
        return {
          title: 'Finalizing',
          steps: ['Reviewing response', 'Checking accuracy', 'Almost ready'],
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          progressColor: 'info'
        };
      default:
        return {
          title: 'Processing',
          steps: ['Working on your request'],
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          progressColor: 'primary'
        };
    }
  };

  const stageInfo = getStageInfo(stage);

  // Simulate progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 300);

    return () => clearInterval(progressInterval);
  }, []);

  // Cycle through steps
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % stageInfo.steps.length);
    }, 2000);

    return () => clearInterval(stepInterval);
  }, [stageInfo.steps.length]);

  return (
    <div className={classnames("flex items-start gap-3 p-4 rounded-lg", stageInfo.bgColor, className)}>
      {/* Animated AI Icon */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Typography variant="body2" className={classnames("font-semibold", stageInfo.color)}>
            {stageInfo.title}
          </Typography>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={classnames(
                  "w-1.5 h-1.5 rounded-full animate-wave",
                  stageInfo.color.replace('text-', 'bg-')
                )}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Current Step */}
        <Typography variant="body2" className="text-gray-600 mb-3 animate-fade-in">
          {stageInfo.steps[currentStep]}
        </Typography>

        {/* Progress Bar */}
        {showProgress && (
          <Box className="w-full">
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              className="h-2 rounded-full"
              sx={{
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: '4px',
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                }
              }}
            />
            <Typography variant="caption" className="text-gray-500 mt-1 block">
              {Math.round(progress)}% complete
            </Typography>
          </Box>
        )}
      </div>
    </div>
  );
};

export default AILoadingIndicator;