import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { THEME_COLORS } from '../../theme/theme';

export function LoadingState({ message = 'Loading...', minHeight = 160 }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 1.5,
        p: 3,
      }}
    >
      <CircularProgress size={32} sx={{ color: THEME_COLORS.primary }} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export function EmptyState({
  title = 'No records found',
  description = 'There is currently no data to display.',
  minHeight = 180,
  action,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 1,
        p: 4,
        textAlign: 'center',
      }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.6, mb: 0.5 }} />
      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380 }}>
        {description}
      </Typography>
      {action && <Box sx={{ mt: 1.5 }}>{action}</Box>}
    </Box>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading this data.',
  onRetry,
  minHeight = 180,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 1,
        p: 4,
        textAlign: 'center',
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 44, color: 'error.main', mb: 0.5 }} />
      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="primary" onClick={onRetry} sx={{ mt: 1.5 }}>
          Try Again
        </Button>
      )}
    </Box>
  );
}

