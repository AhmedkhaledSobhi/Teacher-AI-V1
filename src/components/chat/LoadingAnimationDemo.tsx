// React Imports
import { useState } from 'react';

// MUI Imports
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

// Component Imports
import AIThinkingAnimation from './AIThinkingAnimation';
import AILoadingIndicator from './AILoadingIndicator';

const LoadingAnimationDemo = () => {
  const [isDemo, setIsDemo] = useState(false);

  const variants = ['dots', 'typing', 'progress', 'brain'] as const;
  const stages = ['processing', 'analyzing', 'generating', 'finalizing'] as const;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <Typography variant="h4" className="mb-2">
          AI Loading Animations Demo
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-4">
          Preview different loading animation styles for AI responses
        </Typography>
        <Button
          variant="contained"
          onClick={() => setIsDemo(!isDemo)}
          className="mb-6"
        >
          {isDemo ? 'Stop Demo' : 'Start Demo'}
        </Button>
      </div>

      {isDemo && (
        <>
          {/* Simple Animations */}
          <Paper className="p-6">
            <Typography variant="h5" className="mb-4">
              Simple Animations (AIThinkingAnimation)
            </Typography>
            <Grid container spacing={4}>
              {variants.map((variant) => (
                <Grid item xs={12} md={6} key={variant}>
                  <Box className="p-4 border border-gray-200 rounded-lg">
                    <Typography variant="h6" className="mb-3 capitalize">
                      {variant} Style
                    </Typography>
                    <AIThinkingAnimation variant={variant} stage="processing" />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Detailed Loading Indicators */}
          <Paper className="p-6">
            <Typography variant="h5" className="mb-4">
              Detailed Loading Indicators (AILoadingIndicator)
            </Typography>
            <Grid container spacing={4}>
              {stages.map((stage) => (
                <Grid item xs={12} md={6} key={stage}>
                  <Box className="p-4 border border-gray-200 rounded-lg">
                    <Typography variant="h6" className="mb-3 capitalize">
                      {stage} Stage
                    </Typography>
                    <AILoadingIndicator stage={stage} showProgress={true} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Chat-like Preview */}
          <Paper className="p-6">
            <Typography variant="h5" className="mb-4">
              Chat Interface Preview
            </Typography>
            <div className="space-y-4">
              {/* User Message */}
              <div className="w-full py-4 px-4 bg-white">
                <div className="max-w-4xl mx-auto flex gap-4 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Typography variant="caption" className="text-white font-semibold">
                      U
                    </Typography>
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <Typography variant="body2" className="font-semibold text-gray-900">
                        You
                      </Typography>
                    </div>
                    <Typography variant="body1" className="text-gray-800 leading-relaxed text-right">
                      Can you explain how photosynthesis works?
                    </Typography>
                  </div>
                </div>
              </div>

              {/* AI Loading Response */}
              <div className="w-full py-4 px-4 bg-gray-50">
                <div className="max-w-4xl mx-auto flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                    <Typography variant="caption" className="text-white font-semibold">
                      AI
                    </Typography>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Typography variant="body2" className="font-semibold text-gray-900">
                        AI Assistant
                      </Typography>
                    </div>
                    <AILoadingIndicator stage="analyzing" showProgress={true} />
                  </div>
                </div>
              </div>
            </div>
          </Paper>
        </>
      )}
    </div>
  );
};

export default LoadingAnimationDemo;