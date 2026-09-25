import { Platform, type TextStyle } from 'react-native';

export const Design = {
  colors: {
    surface: '#00161d',
    surfaceBright: '#003f4d',
    surfaceContainerLowest: '#001016',
    surfaceContainerLow: '#001f27',
    surfaceContainer: '#00232c',
    surfaceContainerHigh: '#002f3a',
    surfaceContainerHighest: '#003a47',
    onSurface: '#b7ebfd',
    onSurfaceVariant: '#bac9cc',
    outline: '#849396',
    outlineVariant: '#3b494c',
    primary: '#c6f7ff',
    onPrimary: '#00363d',
    primaryContainer: '#00e7fe',
    onPrimaryContainer: '#00646e',
    secondary: '#a8eaff',
    secondaryContainer: '#03d5fd',
    tertiaryContainer: '#b9d3ff',
    error: '#ffb4ab',
    onError: '#690005',
    background: '#00161d',
    onBackground: '#b7ebfd',
    success: '#7CFFB2',
    successDim: '#1a4a3a',
  },
  fonts: {
    sans: Platform.select({
      web: 'Inter, var(--font-display), ui-sans-serif, system-ui, sans-serif',
      default: undefined,
    }),
    mono: Platform.select({
      web: '"JetBrains Mono", var(--font-mono), ui-monospace, monospace',
      ios: 'Menlo',
      default: 'monospace',
    }),
  },
  radius: {
    sm: 2,
    default: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999,
  },
  space: {
    unit: 4,
    sm: 8,
    md: 16,
    container: 24,
  },
} as const;

export const DesignType = {
  displayLg: {
    fontFamily: Design.fonts.sans,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 48,
  },
  headlineMd: {
    fontFamily: Design.fonts.sans,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.24,
    lineHeight: 32,
  },
  bodyMd: {
    fontFamily: Design.fonts.sans,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  dataLg: {
    fontFamily: Design.fonts.mono,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
  },
  dataSm: {
    fontFamily: Design.fonts.mono,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.26,
    lineHeight: 18,
  },
  labelCaps: {
    fontFamily: Design.fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
} as const satisfies Record<string, TextStyle>;
