import { SheriffConfig, anyTag } from '@softarc/sheriff-core';

export const config: SheriffConfig = {
  entryFile: 'src/main.ts',
  enableBarrelLess: true,
  modules: {
    'src/app': {
      'core/<area>': ['type:core', 'core:<area>'],
      'shared/<area>': 'type:shared',
      'features/<feature>': 'type:feature',
      routes: 'type:routes',
    },
  },
  depRules: {
    root: ['type:core', 'type:routes'],
    'core:*': anyTag,
    'type:core': ['type:core', 'type:shared'],
    'type:shared': ['type:shared', 'core:http', 'core:feedback'],
    'type:feature': ['type:core', 'type:shared'],
    'type:routes': ['type:feature', 'core:auth', 'core:layout'],
  },
};
