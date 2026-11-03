import { createTheme } from '@mui/material/styles';

export const THEME_COLORS = {
  primary: '#FB6600',
  primaryHover: '#E05A00',
  primaryTint: '#FFF3EB',
  pageBgLight: '#F5F6F8',
  cardBgLight: '#FFFFFF',
  cardBorderLight: '#E5E7EB',
  textPrimaryLight: '#111827',
  textSecondaryLight: '#6B7280',

  // Status Chips (Light)
  chips: {
    success: { bg: '#DCFCE7', text: '#166534' },
    warning: { bg: '#FEF3C7', text: '#92400E' },
    danger: { bg: '#FEE2E2', text: '#991B1B' },
    neutral: { bg: '#EEF1F5', text: '#374151' },
    brand: { bg: '#FFF0E6', text: '#FB6600' },
  },

  // Dark equivalents
  pageBgDark: '#0B1120',
  cardBgDark: '#1E293B',
  cardBorderDark: '#334155',
  textPrimaryDark: '#F9FAFB',
  textSecondaryDark: '#94A3B8',
  chipsDark: {
    success: { bg: 'rgba(22, 101, 52, 0.3)', text: '#86EFAC' },
    warning: { bg: 'rgba(146, 64, 14, 0.3)', text: '#FDE047' },
    danger: { bg: 'rgba(153, 27, 27, 0.3)', text: '#FCA5A5' },
    neutral: { bg: 'rgba(55, 65, 81, 0.5)', text: '#E5E7EB' },
    brand: { bg: 'rgba(251, 102, 0, 0.25)', text: '#FFA366' },
  },

  chart: {
    planned: '#FB6600',
    actual: '#FDBA74',
  },
};

export function getAppTheme(mode = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: THEME_COLORS.primary,
        light: '#FF8533',
        dark: THEME_COLORS.primaryHover,
        contrastText: '#FFFFFF',
      },
      background: {
        default: isDark ? THEME_COLORS.pageBgDark : THEME_COLORS.pageBgLight,
        paper: isDark ? THEME_COLORS.cardBgDark : THEME_COLORS.cardBgLight,
      },
      text: {
        primary: isDark ? THEME_COLORS.textPrimaryDark : THEME_COLORS.textPrimaryLight,
        secondary: isDark ? THEME_COLORS.textSecondaryDark : THEME_COLORS.textSecondaryLight,
      },
      divider: isDark ? THEME_COLORS.cardBorderDark : THEME_COLORS.cardBorderLight,
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h1: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.25,
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      subtitle1: {
        fontSize: '0.9375rem',
        color: isDark ? THEME_COLORS.textSecondaryDark : THEME_COLORS.textSecondaryLight,
      },
      body1: {
        fontSize: '0.875rem',
      },
      body2: {
        fontSize: '0.8125rem',
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${isDark ? THEME_COLORS.cardBorderDark : THEME_COLORS.cardBorderLight}`,
            boxShadow: 'none',
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            backgroundColor: THEME_COLORS.primary,
            '&:hover': {
              backgroundColor: THEME_COLORS.primaryHover,
            },
          },
          outlinedPrimary: {
            borderColor: THEME_COLORS.primary,
            color: THEME_COLORS.primary,
            '&:hover': {
              borderColor: THEME_COLORS.primaryHover,
              backgroundColor: isDark ? 'rgba(251, 102, 0, 0.15)' : THEME_COLORS.primaryTint,
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: THEME_COLORS.primary,
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            padding: '12px 16px',
            color: isDark ? THEME_COLORS.textSecondaryDark : THEME_COLORS.textSecondaryLight,
            '&.Mui-selected': {
              color: THEME_COLORS.primary,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isDark ? THEME_COLORS.textSecondaryDark : THEME_COLORS.textSecondaryLight,
            borderBottom: `1px solid ${isDark ? THEME_COLORS.cardBorderDark : THEME_COLORS.cardBorderLight}`,
            padding: '12px 16px',
          },
          body: {
            fontSize: '0.875rem',
            borderBottom: `1px solid ${isDark ? THEME_COLORS.cardBorderDark : THEME_COLORS.cardBorderLight}`,
            padding: '14px 16px',
          },
        },
      },
    },
  });
}

