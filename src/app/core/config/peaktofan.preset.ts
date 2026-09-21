import { definePreset } from '@openng/optimus-ui-themes';
import Aura from '@openng/optimus-ui-themes/aura';

const gold = {
  50: '#fbf7ef',
  100: '#f4ead4',
  200: '#e9d5a9',
  300: '#dcbd7c',
  400: '#d0a95f',
  500: '#c8a45c',
  600: '#ad8a45',
  700: '#8b6d36',
  800: '#6a522a',
  900: '#4a3a1e',
  950: '#2b2111',
};

export const PeaktofanPreset = definePreset(Aura, {
  semantic: {
    primary: gold,
    colorScheme: {
      dark: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#14161b',
          hoverColor: '{primary.400}',
          activeColor: '{primary.600}',
        },
      },
    },
  },
});
