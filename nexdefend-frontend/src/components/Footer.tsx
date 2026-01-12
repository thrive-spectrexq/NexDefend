import React from 'react';
import { Box, Container, Typography, Link, Grid, Stack, IconButton, Divider, Chip } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CircleIcon from '@mui/icons-material/Circle';
import BoltIcon from '@mui/icons-material/Bolt';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ bgcolor: '#050505', position: 'relative', mt: 'auto' }}>

      {/* Gradient Top Line */}
      <Box sx={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0, 209, 255, 0.5), transparent)' }} />

      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Grid container spacing={8}>

          {/* Brand Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BoltIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold" color="white">NexDefend</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300, lineHeight: 1.7 }}>
              Next-generation infrastructure monitoring and threat detection for modern enterprises. Secure your digital frontier.
            </Typography>

            {/* Status Indicator */}
            <Chip
                icon={<CircleIcon sx={{ fontSize: '10px !important', color: '#4caf50 !important' }} />}
                label="All Systems Operational"
                variant="outlined"
                sx={{
                    borderColor: 'rgba(76, 175, 80, 0.3)',
                    color: '#4caf50',
                    bgcolor: 'rgba(76, 175, 80, 0.05)',
                    height: 28,
                    fontSize: '0.75rem'
                }}
            />
          </Grid>

          {/* Links Columns */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle2" color="white" fontWeight="bold" sx={{ mb: 3, letterSpacing: 1 }}>PRODUCT</Typography>
            <Stack spacing={1.5}>
                <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>Features</Link>
                <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>Integrations</Link>
                <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>Pricing</Link>
                <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>Changelog</Link>
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle2" color="white" fontWeight="bold" sx={{ mb: 3, letterSpacing: 1 }}>RESOURCES</Typography>
            <Stack spacing={1.5}>
                <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>Documentation</Link>
                <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>API Reference</Link>
                <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>Community</Link>
                <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>Blog</Link>
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle2" color="white" fontWeight="bold" sx={{ mb: 3, letterSpacing: 1 }}>COMPANY</Typography>
            <Stack spacing={1.5}>
                <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>About</Link>
                <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>Careers</Link>
                <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>Legal</Link>
                <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.9rem' }}>Contact</Link>
            </Stack>
          </Grid>

        </Grid>

        <Divider sx={{ my: 6, borderColor: 'rgba(255,255,255,0.05)' }} />

        {/* Bottom Bar */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} NexDefend Inc. All rights reserved.
            </Typography>

            <Stack direction="row" spacing={1}>
                <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                    <GitHubIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#1DA1F2' } }}>
                    <TwitterIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#0A66C2' } }}>
                    <LinkedInIcon fontSize="small" />
                </IconButton>
            </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
