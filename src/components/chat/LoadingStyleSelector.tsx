// React Imports
import { useState } from 'react';

// MUI Imports
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// Component Imports
import AIThinkingAnimation from './AIThinkingAnimation';
import AILoadingIndicator from './AILoadingIndicator';

interface LoadingStyleSelectorProps {
  onStyleChange: (style: 'simple' | 'detailed') => void;
  currentStyle: 'simple' | 'detailed';
}

const LoadingStyleSelector = ({ onStyleChange, currentStyle }: LoadingStyleSelectorProps) => {
  const [previewStyle, setPreviewStyle] = useState<'simple' | 'detailed'>(currentStyle);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStyle = event.target.value as 'simple' | 'detailed';
    setPreviewStyle(newStyle);
    onStyleChange(newStyle);
  };

  return (
    <Paper className="p-4 mb-4">
      <Typography variant="h6" className="mb-3">
        AI Loading Animation Style
      </Typography>
      
      <FormControl component="fieldset">
        <FormLabel component="legend" className="mb-2">
          Choose your preferred loading animation:
        </FormLabel>
        <RadioGroup
          value={previewStyle}
          onChange={handleChange}
          className="mb-4"
        >
          <FormControlLabel 
            value="simple" 
            control={<Radio />} 
            label="Simple (Brain with spinner)" 
          />
          <FormControlLabel 
            value="detailed" 
            control={<Radio />} 
            label="Detailed (Progress with steps)" 
          />
        </RadioGroup>
      </FormControl>

      {/* Preview */}
      <Box className="mt-4 p-3 bg-gray-50 rounded-lg">
        <Typography variant="body2" className="mb-2 font-medium">
          Preview:
        </Typography>
        {previewStyle === 'simple' ? (
          <AIThinkingAnimation variant="brain" stage="processing" />
        ) : (
          <AILoadingIndicator stage="processing" showProgress={true} />
        )}
      </Box>
    </Paper>
  );
};

export default LoadingStyleSelector;