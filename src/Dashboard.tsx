import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Title } from 'react-admin';

const Dashboard = () => {
  // Récupérer le nom d'utilisateur depuis le localStorage
  const username = localStorage.getItem('username') || 'Administrateur';
  
  return (
    <Card sx={{ marginTop: 2 }}>
      <Title title="Tableau de bord administrateur" />
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Bienvenue, {username}
        </Typography>
        <Typography variant="body1" component="p" paragraph>
          Vous êtes connecté en tant qu'administrateur sur la plateforme Tapakila.
        </Typography>
        <Typography variant="body1" component="p">
          Ce tableau de bord vous permet de gérer les événements, les tickets, les utilisateurs et les réservations.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Dashboard; 