/**
 * Example component demonstrating different ways to fetch and manipulate data
 */

'use client'

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, TextField, Typography, Box, CircularProgress, Alert } from '@mui/material';
import useApi from '@/hooks/useApi';

// Example of a User type
type User = {
  id: string;
  name: string | null;
  email: string | null;
};

export default function UserDataExample() {
  // Example of using the useApi hook for GET requests
  const { data: users, isLoading, error, refetch } = useApi.get<User[]>('/api/users');
  
  // Example of using the useApi hook for POST requests
  const { 
    submit: createUser, 
    isSubmitting: isCreating,
    error: createError
  } = useApi.post<User, { name: string; email: string }>('/api/users', {
    onSuccess: () => {
      // Refetch the users list after creating a new user
      refetch();
      // Reset the form
      setNewUser({ name: '', email: '' });
    }
  });
  
  // State for the new user form
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUser(newUser);
  };
  
  return (
    <div>
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Create New User" />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={newUser.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              disabled={isCreating}
            >
              {isCreating ? <CircularProgress size={24} /> : 'Create User'}
            </Button>
            
            {createError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {createError.message}
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader 
          title="Users List" 
          action={
            <Button onClick={() => refetch()} disabled={isLoading}>
              Refresh
            </Button>
          }
        />
        <CardContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">
              {error.message}
            </Alert>
          ) : !users || users.length === 0 ? (
            <Typography>No users found.</Typography>
          ) : (
            <Box>
              {users.map(user => (
                <Card key={user.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <Typography variant="h6">{user.name || 'No Name'}</Typography>
                  <Typography color="text.secondary">{user.email || 'No Email'}</Typography>
                  <Typography variant="caption">ID: {user.id}</Typography>
                  <Box mt={1} display="flex" gap={1}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => {
                        // Example of navigation to edit page
                        // You could use Next.js router here
                        window.location.href = `/users/${user.id}/edit`;
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="error"
                      onClick={async () => {
                        // Example of using the API directly
                        try {
                          await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
                          refetch();
                        } catch (error) {
                          console.error('Error deleting user:', error);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </div>
  );
}