import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function PageTemplate({ title, subtitle, children }) {
  return (
    <Paper elevation={0} sx={{ p: 3, backgroundColor: 'transparent' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {subtitle}
        </Typography>
      )}
      <Box>{children}</Box>
    </Paper>
  );
}
