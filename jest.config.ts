import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  globals: {
    'ts-jest': {
      diagnostics: false,
      isolatedModules: true,
    },
  },
  preset: 'ts-jest/presets/js-with-ts',
  rootDir: 'test',
  testTimeout: 30 * 1000,
  verbose: true,
};

export default config;
