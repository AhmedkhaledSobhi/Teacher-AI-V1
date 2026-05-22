/**
 * Example component demonstrating how to use server actions directly
 * This is a Server Component that fetches data on the server
 */

import { userActions } from '@/app/server/data-actions';
import { Card, CardContent, CardHeader, Typography, Box, Divider } from '@mui/material';
import UserForm from './UserForm'; // This would be a client component for the form

export default async function ServerActionsExample() {
  // Fetch users using server actions
  const result = await userActions.getAll();
  
  return (
    <div>
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Create User (Server Action)" />
        <CardContent>
          {/* This would be a client component that uses server actions */}
          <UserForm />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader title="Users List (Server Rendered)" />
        <CardContent>
          {result.status === 'error' ? (
            <Typography color="error">Error: {result.error}</Typography>
          ) : !result.data || result.data.length === 0 ? (
            <Typography>No users found.</Typography>
          ) : (
            <Box>
              {result.data.map((user: any) => (
                <Box key={user.id} sx={{ mb: 2 }}>
                  <Typography variant="h6">{user.name || 'No Name'}</Typography>
                  <Typography color="text.secondary">{user.email || 'No Email'}</Typography>
                  <Typography variant="caption">ID: {user.id}</Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </div>
  );
}