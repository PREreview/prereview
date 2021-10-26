const config = {
  globals: {
    'ts-jest': {
      diagnostics: false,
      isolatedModules: true,
    },
  },
  preset: 'ts-jest/presets/js-with-ts',
  testTimeout: 30 * 1000,
  verbose: true,
};

module.exports = config;
