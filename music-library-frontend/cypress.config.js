const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    supportFile: false,
    setupNodeEvents(on, config) {},
  },
  env: {
    USER_TOKEN:  '',  // fill in after getting a real token from your backend
    ADMIN_TOKEN: '',
  },
});
