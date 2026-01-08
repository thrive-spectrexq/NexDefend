import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Link, Alert } from '@mui/material';
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(login({ email, password }));
    if (login.fulfilled.match(resultAction)) {
      navigate('/dashboard');
    }
  };

  return (
    <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', mt: 1 }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>Sign In</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
      <Box sx={{ textAlign: 'center' }}>
        <Link component={RouterLink} to="/register" variant="body2" sx={{ color: 'primary.main' }}>
          {"Don't have an account? Sign Up"}
        </Link>
      </Box>
    </Box>
  );
};

export default LoginPage;
