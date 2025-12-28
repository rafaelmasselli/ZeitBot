module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/__tests__/(.*)$": "<rootDir>/src/__tests__/$1",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.interface.ts",
    "!src/**/__tests__/**",
    "!src/server.ts",
    "!src/**/index.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
};
