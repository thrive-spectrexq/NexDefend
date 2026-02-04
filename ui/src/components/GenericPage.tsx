import React from 'react';
import { Typography, Paper } from '@mui/material';

// A simple generic page component to use for placeholders
interface PageProps {
  title: string;
  description?: string;
}

const GenericPage: React.FC<PageProps> = ({ title, description }) => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="textSecondary" paragraph>
          {description}
        </Typography>
      )}
      <Paper sx={{ p: 3, mt: 3, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          {title} Content Area
        </Typography>
      </Paper>
    </div>
  );
};

export default GenericPage;
