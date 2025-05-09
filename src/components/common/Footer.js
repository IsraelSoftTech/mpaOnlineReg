import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1" color="text.secondary" align="center">
          {'© '}
          <Link component={RouterLink} to="/" color="inherit">
            School Admission System
          </Link>{' '}
          {new Date().getFullYear()}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          <Link component={RouterLink} to="/about" color="inherit" sx={{ mx: 1 }}>
            About
          </Link>
          |
          <Link component={RouterLink} to="/contact" color="inherit" sx={{ mx: 1 }}>
            Contact
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 