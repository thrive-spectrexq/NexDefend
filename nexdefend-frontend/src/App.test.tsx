import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

const TestApp: React.FC<{ initialEntries?: string[] }> = ({ initialEntries = ['/'] }) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );
};

test('renders home page for unauthenticated users', () => {
  render(<TestApp />);
  const headingElement = screen.getByRole('heading', { name: /welcome to nexdefend/i });
  expect(headingElement).toBeInTheDocument();
});

test('renders dashboard heading for authenticated users', () => {
  render(<TestApp initialEntries={['/login']} />);

  const loginButton = screen.getByRole('button', { name: /login/i });
  fireEvent.click(loginButton);

  const headingElement = screen.getByRole('heading', { name: /dashboard/i });
  expect(headingElement).toBeInTheDocument();
});
