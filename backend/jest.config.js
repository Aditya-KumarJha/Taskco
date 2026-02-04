export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {},
  testMatch: ['**/tests/**/*.test.js', '**/__tests__/**/*.js'],
  setupFiles: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
  coverageDirectory: 'coverage',
  forceExit: true,
  testTimeout: 30000,
};
