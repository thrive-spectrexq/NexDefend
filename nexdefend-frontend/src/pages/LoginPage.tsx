import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/store/authSlice';
import type { AppDispatch, RootState } from '@/store';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(login({ email, password }));
    if (login.fulfilled.match(resultAction)) {
      navigate('/dashboard');
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
        bgcolor: 'background.default', // Using the pitch black from theme
        p: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          bgcolor: 'background.default', // Matches page background but Card border makes it distinct
          border: 'none', // As per screenshot, might be floating or just on black. Let's try to match "Sitemark" look.
          // The screenshot shows a card-like container (or at least a defined width) on a dark bg.
          // Actually, looking at the screenshot, it looks like a modal or card centered on dark.
          // Let's stick to standard Card with our new theme override.
          boxShadow: 'none',
          backgroundImage: 'none',
          p: 0,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo Placeholder */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
            <Typography variant="h4" fontWeight="800" letterSpacing={-0.5}>
              NexDefend
            </Typography>
          </Box>

          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
            Sign in
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleLogin}>
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { bgcolor: '#09090b' }
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: 'text.secondary',
                    '&.Mui-checked': { color: 'primary.main' },
                  }}
                />
              }
              label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
              sx={{ mb: 2 }}
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
              {loading ? 'Signing In...' : 'Sign in'}
            </Button>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Forgot your password?
              </Link>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
