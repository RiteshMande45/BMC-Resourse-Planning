import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

/**
 * Official Elliot Brand Icon
 * The iconic C-bracket frame with signature Elliot orange play triangle (#FB6600)
 */
export function ElliotIcon({ size = 36, bracketColor, triangleColor = '#FB6600', sx = {} }) {
  const theme = useTheme();
  const isDark = theme?.palette?.mode === 'dark';
  // Default bracket: white in dark mode, black in light mode, or custom color when specified
  const resolvedBracket = bracketColor || (isDark ? '#FFFFFF' : '#0A0A0A');

  return (
    <Box
      component="svg"
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'block',
        ...sx,
      }}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer C bracket with rounded corners and caps */}
      <path
        d="M 72 22 H 38 A 16 16 0 0 0 22 38 V 62 A 16 16 0 0 0 38 78 H 72"
        stroke={resolvedBracket}
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Signature Elliot Orange Play Triangle */}
      <polygon
        points="42,36 42,64 68,50"
        fill={triangleColor}
        stroke={triangleColor}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </Box>
  );
}

/**
 * Elliot Brand Logo with Typography
 */
export function ElliotBrand({
  title = 'Resource Planning',
  subtitle = 'Elliot Systems Pvt Ltd',
  iconSize = 38,
  bracketColor,
  titleSx = {},
  subtitleSx = {},
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <ElliotIcon size={iconSize} bracketColor={bracketColor} />
      <Box sx={{ overflow: 'hidden' }}>
        <Typography
          variant="subtitle2"
          fontWeight={800}
          sx={{
            lineHeight: 1.2,
            letterSpacing: '0.02em',
            fontSize: '0.9375rem',
            color: 'text.primary',
            ...titleSx,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontSize: '0.75rem',
              lineHeight: 1.2,
              color: 'text.secondary',
              fontWeight: 500,
              mt: 0.25,
              ...subtitleSx,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default ElliotBrand;

