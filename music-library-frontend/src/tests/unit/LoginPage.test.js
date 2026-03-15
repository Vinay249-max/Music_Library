// src/tests/unit/LoginPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import LoginPage from '../../pages/auth/LoginPage';

// Mock the auth service
jest.mock('../../services/authService', () => ({
  login: jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error:   jest.fn(),
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );

describe('LoginPage', () => {
  test('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });

  test('shows validation errors on empty submit', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('shows error for invalid email format', async () => {
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'notanemail');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  test('calls login service with correct credentials', async () => {
    const { login } = require('../../services/authService');
    login.mockResolvedValueOnce({
      data: { token: 'abc123', user: { name: 'Test', email: 't@t.com', role: 'user' } },
    });

    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'user@test.com');
    await userEvent.type(screen.getByPlaceholderText(/••••••••/i), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ email: 'user@test.com', password: 'password123' });
    });
  });

  test('shows error toast on login failure', async () => {
    const { login } = require('../../services/authService');
    const toast = require('react-hot-toast');
    login.mockRejectedValueOnce({ response: { data: { message: 'Wrong password' } } });

    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'user@test.com');
    await userEvent.type(screen.getByPlaceholderText(/••••••••/i), 'wrongpass');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Wrong password');
    });
  });

  test('renders register link', () => {
    renderLogin();
    expect(screen.getByText(/create one/i)).toBeInTheDocument();
  });
});
