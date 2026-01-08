import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { registerUser } from '@/api/auth';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setError(null);
    setLoading(true);

    try {
        await registerUser(email, password);
        // On success, redirect to login
        navigate('/login');
    } catch (err: any) {
        setError(err.response?.data?.message || 'Registration failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          bgcolor: 'background.default',
          border: 'none',
          boxShadow: 'none',
          backgroundImage: 'none',
          p: 0,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo Placeholder */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: 'primary.main' }}>
             <Box
               component="span"
               sx={{
                 width: 24,
                 height: 24,
                 bgcolor: 'primary.main',
                 borderRadius: '50%',
                 mr: 1,
                 display: 'inline-block'
               }}
             />
             <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
               NexDefend
             </Typography>
          </Box>

          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
            Sign up
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleRegister}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
              Email
            </Typography>
            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              placeholder="your@email.com"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { bgcolor: '#09090b' }
              }}
            />

            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
              Password
            </Typography>
            <TextField
              margin="dense"
              required
              fullWidth
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { bgcolor: '#09090b' }
              }}
            />

            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.secondary' }}>
              Confirm Password
            </Typography>
            <TextField
              margin="dense"
              required
              fullWidth
              name="confirmPassword"
              placeholder="••••••"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { bgcolor: '#09090b' }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mb: 2,
                py: 1.2,
                bgcolor: 'white',
                color: 'black',
                '&:hover': { bgcolor: '#e0e0e0' },
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Button>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Link component={RouterLink} to="/login" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
