import { Card, CardContent, Typography } from '@mui/material';
import { Title, useGetList } from 'react-admin';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  // Statistiques des utilisateurs
  const { data: users, isLoading: usersLoading } = useGetList('users', {
    pagination: { page: 1, perPage: 1000 }
  });

  // Statistiques des événements
  const { data: events, isLoading: eventsLoading } = useGetList('events', {
    pagination: { page: 1, perPage: 1000 }
  });

  // Statistiques des réservations confirmées
  const { data: confirmedReservations, isLoading: reservationsLoading } = useGetList('reservations/confirmed', {
    pagination: { page: 1, perPage: 1000 }
  });

  // Logs pour débogage
    console.log('Confirmed Reservations:', confirmedReservations);
    console.log('Confirmed Reservations Length:', confirmedReservations?.length);

  // Données pour le graphique
  const chartData = [
    { name: 'Utilisateurs', count: users?.length || 0 },
    { name: 'Événements', count: events?.length || 0 },
    { name: 'Réservations Confirmées', count: confirmedReservations?.length || 0 },
  ];

  if (usersLoading || eventsLoading || reservationsLoading) return <div>Chargement...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <Title title="Tableau de bord Admin" />
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* Carte Statistiques Utilisateurs */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Utilisateurs
            </Typography>
            <Typography variant="h5" component="div">
              {users?.length || 0}
            </Typography>
          </CardContent>
        </Card>

        {/* Carte Statistiques Événements */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Événements
            </Typography>
            <Typography variant="h5" component="div">
              {events?.length || 0}
            </Typography>
          </CardContent>
        </Card>

        {/* Carte Statistiques Réservations Confirmées */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Réservations Confirmées
            </Typography>
            <Typography variant="h5" component="div">
              {confirmedReservations?.length || 0}
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Graphique */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Statistiques
          </Typography>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Dernières activités */}
      <Card sx={{ marginTop: '20px' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activités récentes
          </Typography>
          {/* Ici vous pourriez ajouter une liste des dernières activités */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
