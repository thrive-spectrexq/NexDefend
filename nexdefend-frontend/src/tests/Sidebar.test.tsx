import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import Sidebar from '../components/common/Sidebar';

describe('Sidebar', () => {
  it('should clear form fields after submission', () => {
    const handleClose = vi.fn();
    const { rerender } = render(<Sidebar isOpen={true} onClose={handleClose} />);

    // Simulate user input
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });

    // Simulate form submission
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Re-render the component to simulate reopening
    rerender(<Sidebar isOpen={true} onClose={handleClose} />);

    // Assert that the form fields are empty
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });
});
