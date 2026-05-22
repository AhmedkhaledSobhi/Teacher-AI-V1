/**
 * Client component form that uses server actions
 */

'use client'

import { useState } from 'react';
import { Button, TextField, CircularProgress, Alert, Box } from '@mui/material';
import { create } from '@/app/server/data-actions';
import { useRouter } from 'next/navigation';

export default function UserForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Call the server action directly
      const result = await create('user', formData, {
        revalidatePath: '/users' // This would revalidate the users page
      });
      
      if (result.status === 'error') {
        setError(result.error || 'An error occurred');
      } else {
        setSuccess(true);
        setFormData({ name: '', email: '' });
        // Refresh the current route to show the new data
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        margin="normal"
        required
      />
      <Box mt={2}>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Create User'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          User created successfully!
        </Alert>
      )}
    </form>
  );
}