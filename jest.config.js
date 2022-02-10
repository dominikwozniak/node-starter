module.exports = {
  preset: 'ts-jest',
  roots: ['./src/__tests__'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1',
  },
  testEnvironment: './prisma/prisma-test-environment.js',
  testPathIgnorePatterns: ['/node_modules/', '__tests__/utils/'],
  setupFilesAfterEnv: ['./setupTests.ts'],
}
