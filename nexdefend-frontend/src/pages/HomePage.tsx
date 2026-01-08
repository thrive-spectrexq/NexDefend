import React from 'react';
import { Box, Button, Container, Grid, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SecurityIcon from '@mui/icons-material/Security';
import MemoryIcon from '@mui/icons-material/Memory';
import { motion } from 'framer-motion';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; delay: number }> = ({ icon, title, description, delay }) => (
  <Grid item xs={12} md={4}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Paper
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          background: 'rgba(10, 25, 41, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 163, 255, 0.1)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 0 20px rgba(0, 163, 255, 0.2)',
            border: '1px solid rgba(0, 163, 255, 0.3)',
          },
        }}
      >
        <Box sx={{ color: 'secondary.main', mb: 2 }}>{icon}</Box>
        <Typography variant="h6" gutterBottom color="text.primary">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Paper>
    </motion.div>
  </Grid>
);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(circle at 50% 50%, #1a2035 0%, #0a0e17 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 8, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <ShieldIcon sx={{ fontSize: 80, color: 'secondary.main', filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.5))' }} />
            </Box>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: 'linear-gradient(45deg, #00A3FF 30%, #00FFCC 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              NexDefend
            </Typography>
            <Typography variant="h4" gutterBottom color="text.secondary" sx={{ fontWeight: 300, mb: 4 }}>
              Systems and Service Monitoring System
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', mb: 6, opacity: 0.8 }}>
              Next-generation observability and security. Unified monitoring, AI-powered threat intelligence, and real-time anomaly detection in a single platform.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              {isAuthenticated ? (
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/dashboard')}
                  sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </motion.div>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <FeatureCard
            icon={<SpeedIcon fontSize="large" />}
            title="Real-Time Monitoring"
            description="Instant visibility into system performance, network traffic, and service health with sub-second latency."
            delay={0.2}
          />
          <FeatureCard
            icon={<AutoGraphIcon fontSize="large" />}
            title="AI Anomaly Detection"
            description="Leverage advanced machine learning models to detect deviations and potential threats before they escalate."
            delay={0.4}
          />
          <FeatureCard
            icon={<SecurityIcon fontSize="large" />}
            title="Threat Intelligence"
            description="Integrated threat feeds and automated correlation to identify and block malicious actors."
            delay={0.6}
          />
          <FeatureCard
            icon={<MemoryIcon fontSize="large" />}
            title="Deep Observability"
            description="Process-level insights and network topology mapping for complete infrastructure awareness."
            delay={0.8}
          />
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
