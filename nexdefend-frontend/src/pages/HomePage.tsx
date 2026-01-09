import React from 'react';
import { Box, Container, Grid, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';
import ShieldIcon from '@mui/icons-material/Shield';
import MemoryIcon from '@mui/icons-material/Memory';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BuildIcon from '@mui/icons-material/Build';
import HubIcon from '@mui/icons-material/Hub';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

const HomePage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          pt: 20,
          pb: 12,
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 30%, rgba(0, 209, 255, 0.1) 0%, rgba(15, 23, 42, 0) 70%)',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: 'center', maxWidth: '900px', mx: 'auto' }}>
              <ShieldIcon sx={{ fontSize: 64, color: 'primary.main', mb: 3, filter: 'drop-shadow(0 0 15px rgba(0, 209, 255, 0.4))' }} />
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                AI-Powered System Monitoring and Threat Intelligence Platform
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6, fontWeight: 300 }}>
                Powered by advanced AI and real-time analytics, NexDefend provides deep visibility, automated defense, and predictive intelligence for systems and modern enterprises.
              </Typography>
            </Box>
          </motion.div>
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
