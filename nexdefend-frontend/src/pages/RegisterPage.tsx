import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  Paper,
  InputAdornment
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    EmailOutlined as EmailIcon,
    LockOutlined as LockIcon,
    AppRegistration as RegIcon
} from '@mui/icons-material';
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
        navigate('/login');
    } catch (err: unknown) {
        // Safe type assertion or check
        const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0B1120',
        background: `radial-gradient(circle at 80% 20%, rgba(245, 0, 87, 0.08) 0%, transparent 40%),
                     radial-gradient(circle at 20% 80%, rgba(0, 209, 255, 0.08) 0%, transparent 40%), #0B1120`,
        p: 2
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <Paper
          elevation={24}
          sx={{
            p: 5,
            bgcolor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 4,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                mb: 2
            }}>
                <RegIcon sx={{ fontSize: 32, color: 'text.primary' }} />
            </Box>
            <Typography variant="h4" fontWeight="800" gutterBottom>
              Get Started
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your account to start monitoring your infrastructure.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleRegister}>
            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              label="Email Address"
              placeholder="name@company.com"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment>,
                sx: { bgcolor: 'rgba(0,0,0,0.2)' }
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              required
              fullWidth
              name="password"
              label="Password"
              placeholder="Create a password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment>,
                sx: { bgcolor: 'rgba(0,0,0,0.2)' }
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Repeat password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment>,
                sx: { bgcolor: 'rgba(0,0,0,0.2)' }
              }}
              sx={{ mb: 4 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)',
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" fontWeight="bold" sx={{ color: 'primary.main', textDecoration: 'none' }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default RegisterPage;
