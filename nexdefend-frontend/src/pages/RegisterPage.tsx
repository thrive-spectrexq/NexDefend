import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Link, Alert } from '@mui/material';
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
    <Box component="form" onSubmit={handleRegister} sx={{ width: '100%', mt: 1 }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>Sign Up</Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
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
        disabled={loading}
        sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
      >
        {loading ? 'Signing Up...' : 'Sign Up'}
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
