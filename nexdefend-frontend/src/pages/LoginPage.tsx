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
  InputAdornment,
  IconButton,
  Paper
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  LockOutlined as LockIcon,
  EmailOutlined as EmailIcon,
  Visibility,
  VisibilityOff,
  Bolt as BoltIcon
} from '@mui/icons-material';
import { login } from '@/store/authSlice';
import type { AppDispatch, RootState } from '@/store';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#0B1120',
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(0, 209, 255, 0.1) 0%, transparent 50%),
          radial-gradient(at 0% 0%, rgba(245, 0, 87, 0.05) 0px, transparent 50%)
        `
      }}
    >
      {/* Animated Background Elements */}
      <Box
        component={motion.div}
        animate={{ rotate: 360 }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        sx={{
          position: 'absolute',
          width: '150vw',
          height: '150vw',
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0, 209, 255, 0.03) 180deg, transparent 360deg)',
          top: '-25vw',
          left: '-25vw',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '420px', zIndex: 1, padding: '20px' }}
      >
        <Paper
          elevation={24}
          sx={{
            p: 5,
            bgcolor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            boxShadow: '0 0 40px rgba(0,0,0,0.5)'
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
                <Box sx={{
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'rgba(0, 209, 255, 0.1)',
                    mb: 2,
                    boxShadow: '0 0 20px rgba(0, 209, 255, 0.2)'
                }}>
                    <BoltIcon sx={{ fontSize: 40, color: '#00D1FF' }} />
                </Box>
            </motion.div>
            <Typography variant="h4" fontWeight="800" color="white" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your credentials to access the secure console.
            </Typography>
          </Box>

          {error && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
               <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#ff8a80', border: '1px solid #ff5252' }}>
                 {error}
               </Alert>
            </motion.div>
          )}

          <Box component="form" onSubmit={handleLogin}>
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { bgcolor: 'rgba(0,0,0,0.2)' }
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'text.secondary' }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                sx: { bgcolor: 'rgba(0,0,0,0.2)' }
              }}
              sx={{ mb: 1 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                control={
                    <Checkbox
                    value="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{ color: 'text.secondary', '&.Mui-checked': { color: 'primary.main' } }}
                    />
                }
                label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
                />
                <Link component={RouterLink} to="/forgot-password" variant="body2" color="primary.main" underline="hover">
                    Forgot password?
                </Link>
            </Box>

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
                background: 'linear-gradient(45deg, #00D1FF, #0099FF)',
                boxShadow: '0 0 20px rgba(0, 209, 255, 0.4)',
                '&:hover': {
                    boxShadow: '0 0 30px rgba(0, 209, 255, 0.6)',
                }
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                New to NexDefend?{' '}
                <Link component={RouterLink} to="/register" fontWeight="bold" sx={{ color: 'primary.main', textDecoration: 'none' }}>
                  Create an account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default LoginPage;
