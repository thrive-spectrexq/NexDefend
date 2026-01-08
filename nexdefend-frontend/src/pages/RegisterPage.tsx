import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '@/store/authSlice';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setError(null);
    console.log('Registering with', email, password);

    // Simulate successful registration and auto-login
    dispatch(login({
      user: { name: email.split('@')[0], role: 'admin' },
      token: 'fake-jwt-token-registered'
    }));
    navigate('/dashboard');
  };

  return (
    <Box component="form" onSubmit={handleRegister} sx={{ width: '100%', mt: 1 }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>Sign Up</Typography>
      {error && (
        <Typography color="error" variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
          {error}
        </Typography>
      )}
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
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        id="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
      >
        Sign Up
      </Button>
      <Box sx={{ textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" variant="body2" sx={{ color: 'primary.main' }}>
          {"Already have an account? Sign In"}
        </Link>
      </Box>
    </Box>
  );
};

export default RegisterPage;
