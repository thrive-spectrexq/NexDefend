import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, borderTop: '1px solid rgba(255, 255, 255, 0.1)', mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              NexDefend
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Systems and Service Monitoring System.
              <br />
              Secure, Intelligent, Resilient.
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Platform
            </Typography>
            <Link href="#" color="text.secondary" display="block">Features</Link>
            <Link href="#" color="text.secondary" display="block">Integration</Link>
            <Link href="#" color="text.secondary" display="block">Security</Link>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Link href="#" color="text.secondary" display="block">Privacy Policy</Link>
            <Link href="#" color="text.secondary" display="block">Terms of Service</Link>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://nexdefend.com/">
              NexDefend
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
