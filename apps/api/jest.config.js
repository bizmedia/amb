/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testEnvironment: "node",
  testMatch: ["<rootDir>/test/**/*.e2e-spec.ts"],
  transform: { "^.+\\.(t|j)s$": "ts-jest" },
  moduleNameMapper: {},
  testTimeout: 30000,
  collectCoverageFrom: ["src/**/*.ts", "!src/main.ts"],
};
