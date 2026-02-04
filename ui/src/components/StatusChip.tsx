import React from 'react';
import { Chip } from '@mui/material';

export type StatusType = 'active' | 'online' | 'offline' | 'critical' | 'warning' | 'info' | 'success' | 'error';

interface StatusChipProps {
  status: string;
  label?: string;
}

const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'online':
    case 'success':
      return 'success';
    case 'offline':
    case 'error':
    case 'critical':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    default:
      return 'default';
  }
};

const StatusChip: React.FC<StatusChipProps> = ({ status, label }) => {
  return (
    <Chip
      label={label || status}
      color={getStatusColor(status)}
      size="small"
      sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
    />
  );
};

export default StatusChip;
