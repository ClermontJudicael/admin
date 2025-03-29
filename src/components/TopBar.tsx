// src/components/TopBar.tsx
import { AppBar, UserMenu, TitlePortal, Logout } from 'react-admin';
import { Box, Typography, MenuItem, IconButton, Badge } from '@mui/material';
import { Search as SearchIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useState } from 'react';

// Composant pour le menu utilisateur personnalisé
const CustomUserMenu = () => {  
  return (
    <UserMenu>
      <MenuItem
        sx={{
          pointerEvents: 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          marginBottom: 1,
        }}
      >
        <Box display="flex" flexDirection="column">
          <Typography variant="body1" fontWeight="bold">Admin User</Typography>
          <Typography variant="body2" color="textSecondary">Administrateur</Typography>
        </Box>
      </MenuItem>
      <MenuItem component="a" href="#/settings">
        <Box display="flex" alignItems="center">
          <Typography>Paramètres</Typography>
        </Box>
      </MenuItem>
      <Logout />
    </UserMenu>
  );
};

// Composant TopBar
const TopBar = () => {
  const [searchText, setSearchText] = useState('');

  return (
    <AppBar
  color="default"
  position="fixed" // Changez sticky à fixed si vous voulez qu'il reste en haut
  userMenu={<CustomUserMenu />}
  sx={{
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    color: 'inherit',
    '& .RaAppBar-toolbar': {
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
      // Ajoutez ceci pour enlever le padding top si nécessaire
      paddingTop: '0.5rem', // Assurez-vous que le padding top est à 0
      paddingBottom: '0.5rem',
    },
    // Assurez-vous qu'il n'y a pas de margin top
    marginBottom: 0, // Assurez-vous que le margin top est à 0
  }}
>

      <TitlePortal />
      
      <Box 
        display="flex" 
        alignItems="center" 
        sx={{ 
          position: 'relative',
          marginLeft: 2,
          marginRight: 2,
          borderRadius: '4px',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
          padding: '0.25rem 0.5rem',
        }}
      >
        <SearchIcon sx={{ color: 'rgba(0, 0, 0, 0.54)', marginRight: 1 }} />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            width: '48%',
            padding: '0.25rem',
            backgroundColor: 'transparent',
            fontSize: '0.875rem',
          }}
        />
      </Box>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <IconButton color="inherit" sx={{ marginRight: 2 }}>
        <Badge badgeContent={2} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </AppBar>
  );
};

export default TopBar;
