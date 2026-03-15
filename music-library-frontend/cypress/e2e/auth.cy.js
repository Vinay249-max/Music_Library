// cypress/e2e/auth.cy.js — End-to-end tests for authentication flow

describe('Authentication Flow', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    cy.visit(baseUrl);
  });

  // ── Registration ────────────────────────────────────────────────
  describe('Registration', () => {
    it('shows register page at /register', () => {
      cy.visit(`${baseUrl}/register`);
      cy.contains(/JOIN MELODIA|Create Account/i, { timeout: 10000 }).should('be.visible');
    });

    it('shows validation errors on empty submit', () => {
      cy.visit(`${baseUrl}/register`);
      cy.get('button[type="submit"]', { timeout: 10000 }).should('not.be.disabled').click();
      cy.contains(/name.*required|required/i, { timeout: 10000 }).should('be.visible');
    });

    it('shows phone validation error for invalid number', () => {
      cy.visit(`${baseUrl}/register`);
      cy.get('input[name="name"]', { timeout: 10000 }).should('be.visible').type('Test User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="phone"]').type('123');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').should('not.be.disabled').click();
      cy.contains(/10-digit|valid phone/i, { timeout: 10000 }).should('be.visible');
    });
  });

  // ── Login ────────────────────────────────────────────────────────
  describe('Login', () => {
    it('redirects to /login from root', () => {
      cy.url().should('include', '/login');
    });

    it('shows MELODIA brand on login page', () => {
      cy.visit(`${baseUrl}/login`);
      cy.contains('MELODIA', { timeout: 10000 }).should('be.visible');
    });

    it('shows validation error for invalid email', () => {
      cy.visit(`${baseUrl}/login`);
      cy.get('input[name="email"]', { timeout: 10000 }).should('be.visible').type('notvalid');
      cy.get('button[type="submit"]').should('not.be.disabled').click();
      cy.contains(/valid email|email is required/i, { timeout: 10000 }).should('be.visible');
    });

    it('shows error toast on wrong credentials', () => {
      // Intercept the login API call and return a 400 error
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 400,
        body: { message: 'Invalid credentials' },
      }).as('loginRequest');

      cy.visit(`${baseUrl}/login`);
      cy.get('input[name="email"]', { timeout: 10000 }).should('be.visible').type('wrong@test.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').should('not.be.disabled').click();
      cy.wait('@loginRequest');
      cy.get('[role="status"]', { timeout: 10000 }).should('be.visible');
    });

    it('navigates to register page via link', () => {
      cy.visit(`${baseUrl}/login`);
      cy.contains('Create one').click();
      cy.url().should('include', '/register');
    });
  });

  // ── Protected routes ────────────────────────────────────────────
  describe('Protected Routes', () => {
    it('redirects unauthenticated user from /home to /login', () => {
      cy.clearLocalStorage();
      cy.visit(`${baseUrl}/home`);
      cy.url().should('include', '/login');
    });

    it('redirects unauthenticated user from /admin to /login', () => {
      cy.clearLocalStorage();
      cy.visit(`${baseUrl}/admin`);
      cy.url().should('include', '/login');
    });
  });
});

// ── User Flow (authenticated) — all API calls are mocked ──────────────────
describe('User Flow (authenticated)', () => {
  const baseUrl = 'http://localhost:3000';

  // Use 'user' role so ProtectedRoute userOnly pages work (not redirected to /admin)
  const mockUser  = { name: 'Test User', email: 'user@test.com', role: 'user' };
  const mockToken = 'fake-jwt-token-for-testing';

  // Helper: visit a page WITH the auth token already in localStorage
  // so React AuthContext reads it on first render (avoids redirect)
  const visitAs = (path) => {
    cy.visit(`${baseUrl}${path}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', mockToken);
        win.localStorage.setItem('user', JSON.stringify(mockUser));
      },
    });
  };

  beforeEach(() => {
    // ── Intercept ALL API calls so no 401 can force a logout/redirect ─────
    cy.intercept('GET', '**/api/**',          { statusCode: 200, body: [] });
    cy.intercept('POST', '**/api/playlists**', { statusCode: 201, body: { _id: '123', name: 'New Playlist' } }).as('createPlaylist');
  });

  it('shows songs page', () => {
    visitAs('/songs');
    cy.contains(/Music Library|Songs/i, { timeout: 10000 }).should('be.visible');
  });

  it('search tab switches correctly', () => {
    visitAs('/search');
    cy.get('.search-tab', { timeout: 10000 }).contains('Artist').should('be.visible').click();
    cy.get('input[placeholder*="Artist"]', { timeout: 10000 }).should('exist');
  });

  it('shows playlists page', () => {
    visitAs('/playlists');
    cy.contains(/My Playlists/i, { timeout: 10000 }).should('be.visible');
    cy.contains(/New Playlist/i).should('be.visible');
  });

  it('can open create playlist modal', () => {
    visitAs('/playlists');
    cy.contains(/New Playlist/i, { timeout: 10000 }).click();
    cy.contains(/Playlist Name/i, { timeout: 10000 }).should('be.visible');
    cy.contains('button', /Cancel/i, { timeout: 10000 }).should('be.visible').click();
  });

  it('shows notifications page', () => {
    visitAs('/notifications');
    cy.contains(/Notifications/i, { timeout: 10000 }).should('be.visible');
  });

  it('shows profile page', () => {
    visitAs('/profile');
    cy.contains(/My Profile/i, { timeout: 10000 }).should('be.visible');
  });
});
