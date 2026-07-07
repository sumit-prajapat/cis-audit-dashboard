/**
 * theme.js - Enterprise design system and theme configuration
 * Inspired by: CrowdStrike Falcon, Palantir, Microsoft Defender, Arc Browser
 */

export const colors = {
  // Primary colors - Security focused
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c3d66',
  },

  // Dark theme for SOC interface
  dark: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a', // Main background
    950: '#020617', // Darker background
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    900: '#14532d',
  },

  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    900: '#7f1d1d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    900: '#78350f',
  },

  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
    900: '#0c3d66',
  },

  // Critical - for high severity
  critical: '#dc2626',
  high: '#f59e0b',
  medium: '#f97316',
  low: '#3b82f6',
};


export const typography = {
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ],
    mono: ['"Fira Code"', '"Courier New"', 'monospace'],
  },

  fontSize: {
    xs: ['12px', { lineHeight: '16px', letterSpacing: '0.4px' }],
    sm: ['13px', { lineHeight: '20px', letterSpacing: '0.3px' }],
    base: ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
    lg: ['16px', { lineHeight: '24px', letterSpacing: '0.15px' }],
    xl: ['18px', { lineHeight: '28px', letterSpacing: '0px' }],
    '2xl': ['24px', { lineHeight: '32px', letterSpacing: '0px' }],
    '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.5px' }],
    '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.5px' }],
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};


export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
};


export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Glassmorphism effects
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  
  // Elevated effects for dark theme
  elevated: '0 10px 40px rgba(0, 0, 0, 0.5)',
};


export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
};


export const transitions = {
  none: 'none',
  fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',

  // Specific transitions
  color: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
};


export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  offcanvas: 1050,
  modal: 1060,
  popover: 1070,
  tooltip: 1080,
  notification: 9999,
};


// Dark mode theme
export const darkTheme = {
  background: {
    primary: colors.dark[950],
    secondary: colors.dark[900],
    tertiary: colors.dark[800],
    elevated: colors.dark[700],
    hover: colors.dark[800],
  },

  text: {
    primary: colors.dark[50],
    secondary: colors.dark[200],
    tertiary: colors.dark[400],
    disabled: colors.dark[500],
  },

  border: {
    light: colors.dark[700],
    dark: colors.dark[600],
  },

  surface: {
    default: colors.dark[900],
    hovered: colors.dark[800],
    pressed: colors.dark[700],
  },
};


// Light mode theme
export const lightTheme = {
  background: {
    primary: '#ffffff',
    secondary: colors.dark[50],
    tertiary: colors.dark[100],
    elevated: colors.dark[200],
    hover: colors.dark[100],
  },

  text: {
    primary: colors.dark[900],
    secondary: colors.dark[600],
    tertiary: colors.dark[500],
    disabled: colors.dark[400],
  },

  border: {
    light: colors.dark[200],
    dark: colors.dark[300],
  },

  surface: {
    default: '#ffffff',
    hovered: colors.dark[50],
    pressed: colors.dark[100],
  },
};


export default {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  zIndex,
  darkTheme,
  lightTheme,
};
