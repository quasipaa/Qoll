module.exports = {
    clearMocks: true,
    coverageProvider: "v8",
    testEnvironment: "node",
    testTimeout: 30000,
    rootDir: "./",
    roots: [ "./" ],
    testMatch: [
        "**/.testing/**/*.js",
        "!**/node_modules/**"
    ]
}
