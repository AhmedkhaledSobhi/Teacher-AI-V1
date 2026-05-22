"use client";

// React Imports
import { useState } from "react";

// MUI Imports
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";

// Util Imports
import api from "@/utils/api";

/**
 * Test page for 401 authentication handling
 * This page allows you to test if 401 responses properly redirect to login
 */
export default function TestAuthPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const test401WithApi = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // This should trigger a 401 and redirect to login
      const data = await api.get("/api/test/401");
      setResult(`Unexpected success: ${JSON.stringify(data)}`);
    } catch (err: any) {
      // This should not be reached if redirect works correctly
      setError(`Error caught: ${err.message}`);
      console.error("Test error:", err);
    } finally {
      setLoading(false);
    }
  };

  const test401WithFetch = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/test/401");
      const data = await response.json();
      setResult(
        `Status: ${response.status}, Data: ${JSON.stringify(data)}`
      );
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const test401WithSkipRedirect = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // This should NOT redirect because we skip auth redirect
      const data = await api.get("/api/test/401", {
        skipAuthRedirect: true,
      });
      setResult(`Unexpected success: ${JSON.stringify(data)}`);
    } catch (err: any) {
      // This should be reached since we skip redirect
      setError(`Error (expected): ${err.message}`);
      setResult("✅ Correctly caught error without redirect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            🔒 401 Authentication Test Page
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use this page to test if 401 responses properly redirect to login
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Test 1:</strong> Click "Test 401 with API Utility" - This
              should redirect you to the login page automatically.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Test 2:</strong> Click "Test 401 with Fetch" - This will
              show the 401 response without redirect (raw fetch doesn't handle
              redirects).
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Test 3:</strong> Click "Test 401 with Skip Redirect" -
              This should show an error without redirecting.
            </Typography>
          </Alert>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={test401WithApi}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              Test 401 with API Utility (Should Redirect)
            </Button>

            <Button
              variant="outlined"
              onClick={test401WithFetch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              Test 401 with Fetch (No Redirect)
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={test401WithSkipRedirect}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              Test 401 with Skip Redirect (Should Not Redirect)
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {result && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Result:</strong> {result}
              </Typography>
            </Alert>
          )}

          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Error:</strong> {error}
              </Typography>
            </Alert>
          )}

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              How to verify the redirect works:
            </Typography>
            <Typography variant="body2" component="div">
              <ol>
                <li>Click "Test 401 with API Utility"</li>
                <li>You should be automatically redirected to the login page</li>
                <li>Check the browser console for redirect logs</li>
                <li>Check the network tab to see the 401 response</li>
              </ol>
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}

