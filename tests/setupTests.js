import '@testing-library/jest-dom';


global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

jest.mock('lib/apiClient', () => require('../tests/__mocks__/apiClient.js'));
jest.mock('lib/supabaseClient', () => require('../tests/__mocks__/supabaseClient.js'));

