/** @type {import('jest').Config} */
module.exports = {
  // Raíz de los tests
  roots: ['<rootDir>/tests/'],

  // Entorno DOM simulado
  testEnvironment: 'jsdom',

  // Setup de Testing Library + mocks globales
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],

  // Transformación con Babel
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },

  // Mocks de archivos estáticos y alias internos
moduleNameMapper: {
  '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

  // Assets
  '^assets/windowsIcons/(.*)$': '<rootDir>/src/__mocks__/fileMock.js',
  '^assets/sounds/(.*)$': '<rootDir>/src/__mocks__/fileMock.js',
  '\\.svg$': '<rootDir>/src/__mocks__/fileMock.js',  // <- este es nuevo

  // Alias internos
  '^state/(.*)$': '<rootDir>/src/state/$1',
  '^components/(.*)$': '<rootDir>/src/components/$1',
  '^components$': '<rootDir>/src/components/index.js',
  '^lib/(.*)$': '<rootDir>/src/lib/$1',
  '^WinXP/(.*)$': '<rootDir>/src/WinXP/$1',
},
  collectCoverageFrom: ['src/WinXP/apps/Admin/index.jsx'], // solo este archivo

  // Ignorar cobertura de archivos no relevantes
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__mocks__/',
    '/src/setupTests.js',
  ],

  // Reportes de coverage
  coverageReporters: ['text', 'lcov', 'html'],

  // Umbrales de coverage
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Extensiones reconocidas
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

  // Mostrar tests lentos
  slowTestThreshold: 5,

  // Evitar problemas con paréntesis en nombres de archivos (Windows)
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$',
  ],

  // Para mocks de módulos ESM si fuera necesario
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
};
