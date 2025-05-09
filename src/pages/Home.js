import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Container>
      <Box
        sx={{
          mt: 8,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Welcome to Our School
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Start your educational journey with us. We provide quality education
          and a supportive learning environment for all our students.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(isAuthenticated ? '/admission' : '/register')}
                startIcon={<PersonAddIcon />}
              >
                {isAuthenticated ? 'Apply Now' : 'Get Started'}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/about')}
                startIcon={<InfoIcon />}
              >
                Learn More
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              Easy Application
            </Typography>
            <Typography>
              Simple and straightforward admission process. Apply online and track
              your application status.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              Quality Education
            </Typography>
            <Typography>
              Experienced faculty, modern facilities, and comprehensive curriculum
              for holistic development.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              Support & Guidance
            </Typography>
            <Typography>
              Dedicated support team to assist you throughout your admission
              journey.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 