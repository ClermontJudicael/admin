import { Card, CardContent, Typography, Grid } from '@mui/material';
import { Title, useGetList } from 'react-admin';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable'; // Pour la date

const Dashboard = () => {
  const { data: users, isLoading: usersLoading } = useGetList('users', {
    pagination: { page: 1, perPage: 1000 }
  });

  const { data: events, isLoading: eventsLoading } = useGetList('events', {
    pagination: { page: 1, perPage: 1000 }
  });

  const { data: confirmedReservations, isLoading: reservationsLoading } = useGetList('reservations/confirmed', {
    pagination: { page: 1, perPage: 1000 }
  });

  const { data: recentEvents, isLoading: recentEventsLoading } = useGetList('events/last-date', {
    pagination: { page: 1, perPage: 6 }
  });

  const chartData = [
    { name: 'Utilisateurs', count: users?.length || 0 },
    { name: 'Événements', count: events?.length || 0 },
    { name: 'Réservations Confirmées', count: confirmedReservations?.length || 0 },
  ];

  if (usersLoading || eventsLoading || reservationsLoading || recentEventsLoading) return <div>Chargement...</div>;

  const stats = [
    { label: 'Utilisateurs', count: users?.length || 0, icon: <PersonIcon fontSize="large" /> },
    { label: 'Événements', count: events?.length || 0, icon: <EventIcon fontSize="large" /> },
    { label: 'Réservations Confirmées', count: confirmedReservations?.length || 0, icon: <CheckCircleIcon fontSize="large" /> },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title title="Tableau de bord Admin" />

      <Grid container spacing={3} marginBottom={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ borderRadius: '12px', boxShadow: 3, padding: '20px', backgroundColor: 'background.paper', textAlign: 'center' }}>
              <CardContent>
                {stat.icon}
                <Typography color="text.primary" gutterBottom sx={{ fontWeight: 'bold', marginTop: '10px' }}>
                  {stat.label}
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {stat.count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: '12px', boxShadow: 3, padding: '10px' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
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

      <Card sx={{ marginTop: '20px', borderRadius: '12px', boxShadow: 3, padding: '10px', backgroundColor: 'background.paper' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Activités récentes
          </Typography>
          <Grid container spacing={3}>
            {recentEvents?.map((event, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ 
                  borderRadius: '12px', 
                  boxShadow: 2, 
                  padding: '10px', 
                  backgroundColor: 'background.default', 
                  textAlign: 'center', 
                  transition: 'transform 0.3s', 
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6,
                  },
                }}>
                  <CardContent>
                    <img
                      src={event.image_url}
                      alt={event.title}
                      style={{ 
                        width: '100%', 
                        height: '120px', 
                        objectFit: 'cover', 
                        borderRadius: '8px', 
                        marginBottom: '10px' 
                      }}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.primary', marginBottom: '5px' }}>
                      {event.title}
                    </Typography>

                    {/* Alignement de la date avec l'icône */}
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <EventAvailableIcon sx={{ marginRight: '8px' }} fontSize="small" />
                      {new Date(event.date).toLocaleDateString('fr-FR')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
