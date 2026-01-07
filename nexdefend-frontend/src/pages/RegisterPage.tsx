import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registering with', email, password);
    navigate('/login');
  };

  return (
    <Box component="form" onSubmit={handleRegister} sx={{ width: '100%', mt: 1 }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>Sign Up</Typography>
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
        <Link href="/login" variant="body2" sx={{ color: 'primary.main' }}>
          {"Already have an account? Sign In"}
        </Link>
      </Box>
    </Box>
  );
};

export default RegisterPage;
