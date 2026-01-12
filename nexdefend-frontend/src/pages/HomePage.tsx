import React from 'react';
import { Box, Container, Grid, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, useTheme, Button, Stack, Divider, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import ShieldIcon from '@mui/icons-material/Shield';
import MemoryIcon from '@mui/icons-material/Memory';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BuildIcon from '@mui/icons-material/Build';
import HubIcon from '@mui/icons-material/Hub';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BugReportIcon from '@mui/icons-material/BugReport';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BoltIcon from '@mui/icons-material/Bolt';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

// --- Hero Animation Component ---
const HeroAnimation: React.FC = () => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main || '#00d1ff';
  const secondaryColor = theme.palette.secondary.main || '#F50057';

  return (
    <Box sx={{ position: 'relative', width: '100%', height: { xs: '350px', md: '550px' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

      {/* Background Glow */}
      <Box
        component={motion.div}
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity }}
        sx={{
          position: 'absolute',
          width: '60%',
          height: '60%',
          background: `radial-gradient(circle, ${primaryColor}33 0%, transparent 70%)`,
          filter: 'blur(60px)',
          zIndex: 0
        }}
      />

      {/* Outer Rotating Radar Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', zIndex: 1 }}
      >
        <Box sx={{
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          border: `1px dashed ${primaryColor}22`,
          borderTop: `1px solid ${primaryColor}`,
          boxShadow: `inset 0 0 20px ${primaryColor}05`
        }} />
      </motion.div>

      {/* Middle Rotating Ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', zIndex: 1 }}
      >
        <Box sx={{
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          border: `1px solid ${primaryColor}11`,
          borderLeft: `2px solid ${secondaryColor}`,
        }} />
      </motion.div>

      {/* Orbiting Cloud Node */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', width: '380px', height: '380px', zIndex: 2 }}
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
            bgcolor: '#0f172a',
            border: `1px solid ${primaryColor}44`,
            boxShadow: `0 0 15px ${primaryColor}33`
          }}
        >
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}>
             <CloudQueueIcon sx={{ color: primaryColor, fontSize: 28 }} />
          </motion.div>
        </Paper>
      </motion.div>

      {/* Scanning Radar Sector */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          zIndex: 1,
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${primaryColor}15 360deg)`
        }}
      />

      {/* Detected Threat Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0, x: 100, y: -60 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0, 1, 1, 0],
          x: [100, 80, 80, 100]
        }}
        transition={{ duration: 5, repeat: Infinity, repeatDelay: 2 }}
        style={{ position: 'absolute', zIndex: 3 }}
      >
        <Paper sx={{ px: 1.5, py: 0.5, bgcolor: 'rgba(245, 0, 87, 0.1)', border: `1px solid ${secondaryColor}`, borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugReportIcon sx={{ fontSize: 18, color: secondaryColor }} />
                <Typography variant="caption" sx={{ color: secondaryColor, fontWeight: 'bold' }}>THREAT BLOCKED</Typography>
            </Box>
        </Paper>
      </motion.div>

      {/* Central Shield Core */}
      <motion.div
        animate={{
            scale: [1, 1.05, 1],
            filter: [`drop-shadow(0 0 15px ${primaryColor}44)`, `drop-shadow(0 0 30px ${primaryColor}88)`, `drop-shadow(0 0 15px ${primaryColor}44)`]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ position: 'absolute', zIndex: 10 }}
      >
        <ShieldIcon sx={{ fontSize: 120, color: primaryColor }} />
      </motion.div>
    </Box>
  );
};

// --- Stat Card Component ---
const StatItem: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 1 }}>
        <Box sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(0, 209, 255, 0.1)',
            color: 'primary.main',
            display: 'flex'
        }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="h5" fontWeight="800" color="white">{value}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Typography>
        </Box>
    </Box>
);

// --- Feature Section Component ---
interface FeatureSectionProps {
  title: string;
  icon: React.ReactNode;
  features: { title: string; description: string }[];
  delay: number;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ title, icon, features, delay }) => {
    const theme = useTheme();
    return (
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            style={{ height: '100%' }}
            >
            <Paper
                sx={{
                p: 4,
                height: '100%',
                bgcolor: 'rgba(30, 41, 59, 0.4)', // Glassmorphism base
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: 'primary.main',
                    boxShadow: `0 20px 40px -10px ${theme.palette.primary.main}22`,
                    '& .icon-glow': {
                        bgcolor: 'primary.main',
                        color: 'black'
                    }
                },
                }}
            >
                {/* Gradient Top Line */}
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #00D1FF, transparent)' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box className="icon-glow" sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        color: 'primary.main',
                        transition: 'all 0.3s ease',
                        mr: 2
                    }}>
                        {icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
                        {title}
                    </Typography>
                </Box>

                <List disablePadding>
                {features.map((feature, index) => (
                    <ListItem key={index} alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                        <Typography variant="body1" color="text.primary" fontWeight="600" sx={{ mb: 0.5 }}>
                            {feature.title}
                        </Typography>
                        }
                        secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
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
};

// --- Main Page Component ---
const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#0B1120' }}>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 14, md: 22 },
          pb: { xs: 8, md: 16 },
          position: 'relative',
          overflow: 'hidden',
          // Subtle mesh gradient background
          background: `
            radial-gradient(at 0% 0%, rgba(0, 209, 255, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(245, 0, 87, 0.1) 0px, transparent 50%)
          `,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">

            {/* Left Column: Text Content */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Chip
                    icon={<BoltIcon sx={{ fontSize: '16px !important' }} />}
                    label="NexDefend v2.0 Live"
                    size="small"
                    sx={{
                        mb: 3,
                        bgcolor: 'rgba(0, 209, 255, 0.1)',
                        color: 'primary.main',
                        border: '1px solid rgba(0, 209, 255, 0.2)',
                        fontWeight: 'bold'
                    }}
                />

                <Typography variant="h1" sx={{
                    fontWeight: 900,
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    color: 'white'
                }}>
                  Defend Your <br/>
                  <Box component="span" sx={{
                      background: 'linear-gradient(90deg, #00D1FF 0%, #00ff9d 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                  }}>
                    Digital Frontier
                  </Box>
                </Typography>

                <Typography variant="h5" color="text.secondary" sx={{ mb: 5, lineHeight: 1.6, fontWeight: 400, maxWidth: '650px' }}>
                  Unified system monitoring, AI-powered threat detection, and automated incident response for the modern enterprise.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/register')}
                        sx={{
                            px: 4,
                            py: 1.8,
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            borderRadius: '50px',
                            background: 'linear-gradient(45deg, #00D1FF, #0099FF)',
                            boxShadow: '0 0 20px rgba(0, 209, 255, 0.4)',
                            '&:hover': {
                                boxShadow: '0 0 30px rgba(0, 209, 255, 0.6)',
                            }
                        }}
                    >
                        Get Started
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/docs')} // Assuming a docs route or demo
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            px: 4,
                            py: 1.8,
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            borderRadius: '50px',
                            borderColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            '&:hover': {
                                borderColor: 'white',
                                bgcolor: 'rgba(255,255,255,0.05)'
                            }
                        }}
                    >
                        Live Demo
                    </Button>
                </Stack>

                <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', gap: 2, opacity: 0.8 }}>
                    <Typography variant="caption" color="text.secondary">TRUSTED BY MODERN TEAMS</Typography>
                    <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                    <Box sx={{ display: 'flex', gap: 2, opacity: 0.5 }}>
                        {/* Placeholders for logos */}
                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'white' }} />
                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'white' }} />
                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'white' }} />
                    </Box>
                </Box>

              </motion.div>
            </Grid>

            {/* Right Column: Animation */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <HeroAnimation />
              </motion.div>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* Stats Bar */}
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(0,0,0,0.2)' }}>
          <Container maxWidth="xl">
            <Grid container spacing={0} justifyContent="center" alignItems="center" sx={{ py: 2 }}>
                <Grid size={{ xs: 12, md: 4 }} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.05)' } }}>
                    <StatItem label="Active Monitoring" value="24/7" icon={<SecurityIcon />} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.05)' } }}>
                    <StatItem label="Threats Blocked" value="99.9%" icon={<BugReportIcon />} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatItem label="System Latency" value="< 10ms" icon={<SpeedIcon />} />
                </Grid>
            </Grid>
          </Container>
      </Box>

      {/* Features Grid */}
      <Box sx={{ py: 12, position: 'relative' }}>
        {/* Background blobs for depth */}
        <Box sx={{ position: 'absolute', top: '20%', left: '-10%', width: '500px', height: '500px', bgcolor: 'primary.main', filter: 'blur(200px)', opacity: 0.05, zIndex: 0 }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 10 }}>
                <Typography variant="overline" color="primary.main" fontWeight="bold" letterSpacing={2}>
                    CAPABILITIES
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, mt: 1, mb: 2 }}>
                    Comprehensive Security <br />
                    <span style={{ opacity: 0.5 }}>Without the Complexity</span>
                </Typography>
            </Box>

            <Grid container spacing={4}>
            <FeatureSection
                title="System Monitoring"
                icon={<MemoryIcon fontSize="large" />}
                delay={0.1}
                features={[
                { title: 'Resource Tracking', description: 'Real-time telemetry for CPU, Memory, Disk, and Network IO across your entire fleet.' },
                { title: 'Process Forensics', description: 'Deep inspection of process trees to identify unauthorized execution paths.' },
                { title: 'FIM Integrity', description: 'Cryptographic tracking of critical system files to detect tampering immediately.' },
                ]}
            />
            <FeatureSection
                title="Threat Intelligence"
                icon={<ShieldIcon fontSize="large" />}
                delay={0.2}
                features={[
                { title: 'AI Anomaly Detection', description: 'Unsupervised learning (Isolation Forest) detects deviations from baseline behavior.' },
                { title: 'CVE Scanning', description: 'Automated vulnerability assessments powered by integrated Trivy and Nmap engines.' },
                { title: 'Proactive Hunting', description: 'Query your infrastructure state like a database to find hidden threats.' },
                ]}
            />
            <FeatureSection
                title="Automated SOAR"
                icon={<BuildIcon fontSize="large" />}
                delay={0.3}
                features={[
                { title: 'Instant Remediation', description: 'Trigger automated playbooks to isolate infected hosts or kill malicious processes.' },
                { title: 'Incident Workflows', description: 'Streamlined case management for tracking alerts from detection to resolution.' },
                { title: 'Compliance Checks', description: 'Continuous auditing of SSH, Firewall, and OS configurations.' },
                ]}
            />
            <FeatureSection
                title="Cloud Native"
                icon={<CloudQueueIcon fontSize="large" />}
                delay={0.4}
                features={[
                { title: 'K8s & Docker', description: 'Native visibility into container orchestration and microservices health.' },
                { title: 'Cloud Posture (CSPM)', description: 'Validate configurations across AWS, Azure, and GCP environments.' },
                { title: 'Workload Protection', description: 'Runtime security for ephemeral cloud workloads.' },
                ]}
            />
            <FeatureSection
                title="Cognitive Core"
                icon={<PsychologyIcon fontSize="large" />}
                delay={0.5}
                features={[
                { title: 'Sentinel AI Copilot', description: 'Conversational interface to query system health and explain security alerts.' },
                { title: 'Predictive Metrics', description: 'Forecast resource exhaustion incidents before they cause downtime.' },
                { title: 'Smart Scoring', description: 'Context-aware risk scoring to reduce alert fatigue.' },
                ]}
            />
            <FeatureSection
                title="Network Defense"
                icon={<HubIcon fontSize="large" />}
                delay={0.6}
                features={[
                { title: 'Traffic Visualizer', description: 'Interactive topology maps showing lateral movement and external connections.' },
                { title: 'IDS/IPS Engine', description: 'Signature-based detection (Suricata) for known exploit patterns.' },
                { title: 'DNS Security', description: 'Identification of DGA (Domain Generation Algorithms) and C2 communication.' },
                ]}
            />
            </Grid>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box sx={{
          py: 12,
          bgcolor: 'rgba(0, 209, 255, 0.03)',
          borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Ready to Secure Your Infrastructure?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, opacity: 0.8 }}>
                  Join thousands of developers and security engineers using NexDefend.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                    px: 6, py: 2,
                    borderRadius: '50px',
                    fontSize: '1.1rem',
                    boxShadow: '0 0 30px rgba(0, 209, 255, 0.3)'
                }}
            >
                  Create Free Account
              </Button>
          </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default HomePage;
