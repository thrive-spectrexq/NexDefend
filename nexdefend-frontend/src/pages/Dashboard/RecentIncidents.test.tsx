import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecentIncidents from './RecentIncidents';
import { Incident } from '../../api/apiClient';

const mockIncidents: Incident[] = [
  {
    id: 1,
    description: 'Critical Anomaly',
    severity: 'Critical',
    status: 'Open',
    assignee: 'admin',
    notes: '{}',
    created_at: '2023-10-27T10:00:00Z',
    updated_at: '2023-10-27T10:00:00Z',
  },
  {
    id: 2,
    description: 'Minor Issue',
    severity: 'Low',
    status: 'Resolved',
    assignee: 'admin',
    notes: '{}',
    created_at: '2023-10-26T10:00:00Z',
    updated_at: '2023-10-26T10:00:00Z',
  },
];

describe('RecentIncidents Component', () => {
  it('renders correctly with incidents', () => {
    render(<RecentIncidents incidents={mockIncidents} />);
    expect(screen.getByText('Recent Incidents')).toBeInTheDocument();
    expect(screen.getByText('Critical Anomaly')).toBeInTheDocument();
    expect(screen.getByText('Minor Issue')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument(); // Badge
  });

  it('renders empty state when no incidents provided', () => {
    render(<RecentIncidents incidents={[]} />);
    expect(screen.getByText('No active incidents found.')).toBeInTheDocument();
  });

  it('limits display to 5 items', () => {
    const manyIncidents = Array.from({ length: 10 }, (_, i) => ({
      ...mockIncidents[0],
      id: i,
      description: `Incident ${i}`,
      created_at: new Date(Date.now() - i * 1000).toISOString(),
    }));
    render(<RecentIncidents incidents={manyIncidents} />);
    // Should show 5 items + "View All Incidents" button
    expect(screen.getAllByText(/Incident \d/)).toHaveLength(5);
    expect(screen.getByText('View All Incidents')).toBeInTheDocument();
  });
});
