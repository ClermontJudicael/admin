import { Menu, MenuItemLink } from "react-admin";
import { makeStyles } from '@mui/styles';
import { Dashboard, Event, ConfirmationNumber, People, Book } from '@mui/icons-material';

const useStyles = makeStyles((theme) => ({
  menuItem: {
    fontSize: '1.1rem',
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  menu: {
    height: '88vh',  // Assure-toi que le menu prend toute la hauteur de l'écran
    paddingTop: theme.spacing(1),  // Un peu d'espace en haut pour que le contenu soit bien espacé
    paddingLeft: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(2.5),
    marginLeft: theme.spacing(0.5),
  },
}));

const CustomMenu = (props: any) => {
  const classes = useStyles();
  
  return (
    <Menu {...props} className={classes.menu}>
      <MenuItemLink to="/dashboard" primaryText="Dashboard" leftIcon={<Dashboard />} className={classes.menuItem} />
      <MenuItemLink to="/events" primaryText="Events" leftIcon={<Event />} className={classes.menuItem} />
      <MenuItemLink to="/tickets" primaryText="Tickets" leftIcon={<ConfirmationNumber />} className={classes.menuItem} />
      <MenuItemLink to="/users" primaryText="Users" leftIcon={<People />} className={classes.menuItem} />
      <MenuItemLink to="/reservations" primaryText="Reservations" leftIcon={<Book />} className={classes.menuItem} />
    </Menu>
  );
};

export default CustomMenu;
