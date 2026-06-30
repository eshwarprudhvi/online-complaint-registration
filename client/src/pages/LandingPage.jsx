import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import TimelineIcon from '@mui/icons-material/Timeline';
import SecurityIcon from '@mui/icons-material/Security';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LoginIcon from '@mui/icons-material/Login';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Easy Registration',
      description: 'Lodge your complaints quickly and easily with our intuitive form and automated category detection.'
    },
    {
      icon: <TimelineIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Live Tracking',
      description: 'Track the status of your complaints in real-time. Get instant updates when action is taken.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure & Transparent',
      description: 'Your data is secure. All interactions are logged and auditable for complete transparency.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      
      {/* Navbar Section */}
      <Box sx={{ py: 3, px: { xs: 3, md: 8 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentTurnedInIcon />
          ComplaintPortal
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="text" 
            color="inherit" 
            onClick={() => navigate('/login')}
            sx={{ fontWeight: 'bold' }}
          >
            Login
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/register')}
            sx={{ borderRadius: 2, px: 3, boxShadow: 'none' }}
          >
            Register
          </Button>
        </Box>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: { xs: 8, md: 12 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography variant="h1" fontWeight="900" sx={{ fontSize: { xs: '3rem', md: '4.5rem' }, lineHeight: 1.1, mb: 3 }}>
                Resolve Issues <br />
                <Typography component="span" variant="h1" fontWeight="900" sx={{ fontSize: 'inherit', color: 'primary.main' }}>
                  Faster Together.
                </Typography>
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 5, fontWeight: 'normal', lineHeight: 1.6, maxWidth: '90%' }}>
                A centralized, modern platform for citizens to voice concerns, and for authorities to take swift, transparent action.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<HowToRegIcon />}
                  onClick={() => navigate('/register')}
                  sx={{ py: 1.5, px: 4, borderRadius: 3, fontSize: '1.1rem', boxShadow: 3 }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                  sx={{ py: 1.5, px: 4, borderRadius: 3, fontSize: '1.1rem', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                >
                  Sign In
                </Button>
              </Box>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box 
                component="img"
                src="https://illustrations.popsy.co/amber/student-going-to-school.svg"
                alt="Hero Illustration"
                sx={{ width: '100%', maxWidth: 600, height: 'auto', display: 'block', mx: 'auto' }}
              />
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 10, borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Why Use Our Platform?
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Designed for efficiency, transparency, and rapid resolution.
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 4, 
                      height: '100%',
                      borderRadius: 4, 
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.default',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 4,
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.default', py: 4, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Complaint Registration System. All rights reserved.
        </Typography>
      </Box>

    </Box>
  );
};

export default LandingPage;
