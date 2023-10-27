module.exports = {
    verbose: true,
    extensionsToTreatAsEsm: ['.ts'],
    testEnvironment: "node",
    reporters: ['default'],
    transform: {
        '^.+\\.(ts|tsx)$': [
            'esbuild-jest',
            {
                target: 'esnext',
                format: 'cjs',
            }
        ],
    }
}
