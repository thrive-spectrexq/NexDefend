import React from 'react';
import { Box, Container, Grid, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import ShieldIcon from '@mui/icons-material/Shield';
import MemoryIcon from '@mui/icons-material/Memory';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BuildIcon from '@mui/icons-material/Build';
import HubIcon from '@mui/icons-material/Hub';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BugReportIcon from '@mui/icons-material/BugReport';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// --- Hero Animation Component ---
const HeroAnimation: React.FC = () => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main || '#00d1ff';

  return (
    <Box sx={{ position: 'relative', width: '100%', height: { xs: '350px', md: '500px' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

      {/* Background Glow */}
      <Box
        component={motion.div}
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${primaryColor}22 0%, transparent 70%)`,
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />

      {/* Outer Rotating Radar Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', zIndex: 1 }}
      >
        <Box sx={{
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          border: `1px dashed ${primaryColor}33`,
          borderTopColor: primaryColor,
          boxShadow: `0 0 20px ${primaryColor}11`
        }} />
      </motion.div>

      {/* Inner Counter-Rotating Ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', zIndex: 1 }}
      >
        <Box sx={{
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          border: `1px solid ${primaryColor}22`,
          borderLeft: `2px solid ${primaryColor}`,
        }} />
      </motion.div>

      {/* Orbiting Cloud Node */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', width: '340px', height: '340px', zIndex: 2 }}
      >
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-360deg)', // Counter rotate to keep icon upright
            p: 1.5,
            borderRadius: '50%',
            bgcolor: '#09090b',
            border: `1px solid ${primaryColor}`,
          }}
        >
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
             <CloudQueueIcon sx={{ color: primaryColor, fontSize: 24 }} />
          </motion.div>
        </Paper>
      </motion.div>

      {/* Orbiting Memory Node */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, delay: 6, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', width: '340px', height: '340px', zIndex: 2 }}
      >
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 1.5,
            borderRadius: '50%',
            bgcolor: '#09090b',
            border: `1px solid ${primaryColor}`,
          }}
        >
           <motion.div animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
              <MemoryIcon sx={{ color: primaryColor, fontSize: 24 }} />
           </motion.div>
        </Paper>
      </motion.div>

      {/* Scanning Radar Sector */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          width: '280px',
          height: '280px',
          zIndex: 1,
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${primaryColor}22 360deg)`
        }}
      />

      {/* Detected Threat Disappearing (Simulation) */}
      <motion.div
        initial={{ opacity: 0, scale: 0, x: 80, y: -50 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0, 1, 1, 0],
          color: ['#ff4444', '#ff4444', '#00d1ff', '#00d1ff']
        }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
        style={{ position: 'absolute', zIndex: 2 }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <BugReportIcon sx={{ fontSize: 30 }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.6rem', mt: -0.5 }}>
            THREAT
          </Typography>
        </Box>
      </motion.div>

      {/* Central Shield Core */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], filter: [`drop-shadow(0 0 10px ${primaryColor}66)`, `drop-shadow(0 0 25px ${primaryColor})`, `drop-shadow(0 0 10px ${primaryColor}66)`] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ position: 'absolute', zIndex: 10 }}
      >
        <ShieldIcon sx={{ fontSize: 100, color: primaryColor }} />
      </motion.div>

      {/* Decorative Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            background: primaryColor,
            borderRadius: '50%',
            top: '50%',
            left: '50%',
          }}
          animate={{
            x: [0, Math.cos(i * 60 * (Math.PI / 180)) * 180],
            y: [0, Math.sin(i * 60 * (Math.PI / 180)) * 180],
            opacity: [1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut"
          }}
        />
      ))}
    </Box>
  );
};

// --- Feature Section Component (Unchanged) ---
interface FeatureSectionProps {
  title: string;
  icon: React.ReactNode;
  features: { title: string; description: string }[];
  delay: number;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ title, icon, features, delay }) => (
  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Paper
        sx={{
          p: 3,
          height: '100%',
          bgcolor: '#09090b',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 0 20px rgba(0, 209, 255, 0.1)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'primary.main' }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <List>
          {features.map((feature, index) => (
            <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: 'primary.dark' }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" color="text.primary" fontWeight="bold">
                    {feature.title}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </motion.div>
  </Grid>
);

// --- Main Page Component ---
const HomePage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 12, md: 20 },
          pb: 12,
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 30%, rgba(0, 209, 255, 0.05) 0%, rgba(15, 23, 42, 0) 70%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">

            {/* Left Column: Text Content */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography variant="h1" sx={{ fontWeight: 800, mb: 1, letterSpacing: -1, color: 'common.white', fontSize: { xs: '3rem', md: '4.5rem' } }}>
                    NexDefend
                  </Typography>
                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '2rem', md: '3rem' },
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2,
                      lineHeight: 1.2
                    }}
                  >
                    AI-Powered System Monitoring and Threat Intelligence Platform
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6, fontWeight: 300, maxWidth: '600px', mx: { xs: 'auto', md: 0 } }}>
                    Powered by advanced AI and real-time analytics, NexDefend provides deep visibility, automated defense, and predictive intelligence for systems and modern enterprises.
                  </Typography>
                </Box>
              </motion.div>
            </Grid>

            {/* Right Column: Animation */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <HeroAnimation />
              </motion.div>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* Features Grid */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Grid container spacing={3}>
          <FeatureSection
            title="System Monitoring"
            icon={<MemoryIcon />}
            delay={0.1}
            features={[
              { title: 'Resource Usage Tracking', description: 'Real-time monitoring of CPU, Memory, Disk, and Network usage across all endpoints.' },
              { title: 'Process Monitoring', description: 'Deep inspection of running processes to detect anomalies and unauthorized execution.' },
              { title: 'File Integrity Monitoring (FIM)', description: 'Real-time tracking of changes to critical system files to prevent tampering.' },
            ]}
          />
          <FeatureSection
            title="Threat Intelligence"
            icon={<ShieldIcon />}
            delay={0.2}
            features={[
              { title: 'AI-Powered Analysis', description: 'Anomaly detection using Isolation Forest and real-time AI scoring of security events.' },
              { title: 'Threat Hunting', description: 'Advanced search capabilities to uncover hidden threats within your network.' },
              { title: 'Vulnerability Detection', description: 'Automated scanning (powered by Nmap and Trivy) to identify open ports and CVEs.' },
            ]}
          />
          <FeatureSection
            title="Automated Remediation"
            icon={<BuildIcon />}
            delay={0.3}
            features={[
              { title: 'Incident Response', description: 'Automated workflow for incident creation, assignment, and tracking.' },
              { title: 'Auto-Scaling', description: '(Planned) Dynamic resource adjustment based on load and threat levels.' },
              { title: 'IT Hygiene', description: 'Automated compliance checks for SSH, Firewall, and System configurations.' },
            ]}
          />
          <FeatureSection
            title="Cloud Monitoring"
            icon={<CloudQueueIcon />}
            delay={0.4}
            features={[
              { title: 'Container Metrics', description: 'Native integration for monitoring Docker and Kubernetes workloads.' },
              { title: 'Cloud Posture', description: 'Assessment of cloud infrastructure security configurations.' },
              { title: 'Workload Health', description: 'Continuous health checks for distributed cloud services.' },
            ]}
          />
          <FeatureSection
            title="Cognitive Intelligence"
            icon={<PsychologyIcon />}
            delay={0.5}
            features={[
              { title: 'GenAI Copilot ("Sentinel")', description: 'Context-aware AI assistant for querying system state and threat insights.' },
              { title: 'Predictive Forecasting', description: 'Linear regression modeling to forecast resource usage trends for the next 24 hours.' },
              { title: 'Anomaly Scoring', description: 'Real-time scoring of events using Isolation Forest to detect deviations.' },
            ]}
          />
          <FeatureSection
            title="Network Defense"
            icon={<HubIcon />}
            delay={0.6}
            features={[
              { title: 'Traffic Analysis', description: 'Real-time flow monitoring and visualization of network connections.' },
              { title: 'Intrusion Detection', description: 'Signature-based detection of malicious network activity using Suricata rules.' },
              { title: 'DNS Security', description: 'Monitoring for malicious domain requests and DGA patterns.' },
            ]}
          />
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};

export default HomePage;
