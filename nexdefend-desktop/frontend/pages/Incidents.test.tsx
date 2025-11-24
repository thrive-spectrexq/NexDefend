import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Incidents from './Incidents';
import { apiClient } from '../api/apiClient';
import type { Incident } from '../api/apiClient';

// Mock the apiClient
vi.mock('../api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

// --- FIX: Cast the specific methods, not the whole object ---
const mockedApiGet = vi.mocked(apiClient.get);
const mockedApiPut = vi.mocked(apiClient.put);
// --- END FIX ---

const mockIncidents: Incident[] = [
  {
    id: 1,
    description: 'AI Anomaly Detected: Test Attack',
    severity: 'Critical',
    status: 'Open',
    assignee: '',
    notes: '[]',
    created_at: '2025-11-11T20:00:00Z',
    updated_at: '2025-11-11T20:00:00Z',
  },
  {
    id: 2,
    description: 'File Integrity Violation: /etc/passwd has been modified',
    severity: 'High',
    status: 'In Progress',
    assignee: 'admin',
    notes: '[]',
    created_at: '2025-11-11T21:00:00Z',
    updated_at: '2025-11-11T21:00:00Z',
  },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderComponent = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <Incidents />
    </QueryClientProvider>
  );

describe('Incidents Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
  });

  it('renders a loading state initially', () => {
    // --- FIX: Use mockedApiGet ---
    mockedApiGet.mockResolvedValueOnce({ data: [] });
    renderComponent();
    expect(screen.getByRole('heading', { name: /security incidents/i })).toBeInTheDocument();
    expect(screen.getByTitle('Loading...')).toBeInTheDocument();
  });

  it('fetches and displays incidents in the table', async () => {
    // --- FIX: Use mockedApiGet ---
    mockedApiGet.mockResolvedValueOnce({ data: mockIncidents });
    renderComponent();

    expect(await screen.findByText('#1')).toBeInTheDocument();
    expect(screen.getByText('AI Anomaly Detected: Test Attack')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();

    expect(await screen.findByText('#2')).toBeInTheDocument();
    expect(screen.getByText(/File Integrity Violation/i)).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('opens the modal when "Manage" is clicked', async () => {
    // --- FIX: Use mockedApiGet ---
    mockedApiGet.mockResolvedValueOnce({ data: mockIncidents });
    renderComponent();

    // Find the "Manage" button for the first incident
    const manageButton = await screen.findAllByRole('button', { name: /manage/i });
    fireEvent.click(manageButton[0]);

    // Check if the modal title is visible
    expect(await screen.findByRole('heading', { name: /incident #1/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Open')).toBeInTheDocument();
  });

  it('updates an incident status when modal is saved', async () => {
    // --- FIX: Use mockedApiGet and mockedApiPut ---
    mockedApiGet.mockResolvedValue({ data: mockIncidents });
    mockedApiPut.mockResolvedValue({ data: {} }); // Mock the PUT request
    renderComponent();

    // Open the modal
    const manageButton = await screen.findAllByRole('button', { name: /manage/i });
    fireEvent.click(manageButton[0]);
    expect(await screen.findByRole('heading', { name: /incident #1/i })).toBeInTheDocument();

    // Change the status
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'Resolved' } });

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    // Wait for the mutation to complete and modal to close
    await waitFor(() => {
      expect(mockedApiPut).toHaveBeenCalledWith('/incidents/1', { status: 'Resolved' });
    });
  });
});
