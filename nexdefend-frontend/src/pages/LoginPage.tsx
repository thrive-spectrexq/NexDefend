import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '@/store/authSlice';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login API call
    console.log('Logging in with', email, password);
    dispatch(login({
      user: { name: 'Admin', role: 'admin' },
      token: 'fake-jwt-token'
    }));
    navigate('/dashboard');
  };

  return (
    <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', mt: 1 }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>Sign In</Typography>
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
        sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
      >
        Sign In
      </Button>
      <Box sx={{ textAlign: 'center' }}>
        <Link href="/register" variant="body2" sx={{ color: 'primary.main' }}>
          {"Don't have an account? Sign Up"}
        </Link>
      </Box>
    </Box>
  );
};

export default LoginPage;
