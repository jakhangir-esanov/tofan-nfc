import { definePreset } from '@openng/optimus-ui-themes';
import Aura from '@openng/optimus-ui-themes/aura';

const gold = {
  50: '#fbf7ef',
  100: '#f4ead4',
  200: '#ecd9a6',
  300: '#dcbd7a',
  400: '#d2b06a',
  500: '#c9a35a',
  600: '#b98f46',
  700: '#8f6f2f',
  800: '#6b4f18',
  900: '#4a3a1e',
  950: '#2b2111',
};

const CONTROL_RADIUS = '14px';
const CONTROL_PADDING = '1rem';

export const PeaktofanPreset = definePreset(Aura, {
  semantic: {
    primary: gold,
    colorScheme: {
      light: {
        primary: {
          color: '#0b0c10',
          contrastColor: '#f4efe2',
          hoverColor: '#23252e',
          activeColor: '#000000',
        },
        formField: {
          background: '#f2f0ea',
          borderColor: 'rgba(11, 12, 16, 0.1)',
          hoverBorderColor: '{primary.700}',
          focusBorderColor: '{primary.700}',
          color: '#0b0c10',
        },
      },
      dark: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#1a1305',
          hoverColor: '{primary.400}',
          activeColor: '{primary.600}',
        },
        formField: {
          background: '#0a0b0f',
          borderColor: 'rgba(255, 255, 255, 0.09)',
          hoverBorderColor: '{primary.500}',
          focusBorderColor: '{primary.500}',
          color: '#f2f0eb',
        },
      },
    },
  },
  components: {
    button: {
      root: {
        borderRadius: CONTROL_RADIUS,
        paddingY: CONTROL_PADDING,
        label: { fontWeight: '700' },
      },
    },
    inputtext: {
      root: {
        borderRadius: CONTROL_RADIUS,
        paddingY: CONTROL_PADDING,
        paddingX: CONTROL_PADDING,
      },
    },
  },
});
