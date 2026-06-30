import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';

export const SummaryCards = ({ stats, color = "primary.main" }) => {
  if (!stats) return null;

  return (
    <Grid container spacing={3}>
      {Object.entries(stats).map(([key, value]) => (
        <Grid xs={12} sm={6} md={3} key={key}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              border: '1px solid', 
              borderColor: 'divider',
              boxShadow: 1,
              transition: '0.3s',
              '&:hover': {
                boxShadow: 3,
                borderColor: color
              }
            }}
          >
            <CardContent>
              <Typography color="text.secondary" gutterBottom sx={{ textTransform: 'capitalize', fontWeight: 'medium', fontSize: '0.9rem' }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Typography>
              <Typography variant="h3" sx={{ color, fontWeight: 'bold' }}>
                {value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
