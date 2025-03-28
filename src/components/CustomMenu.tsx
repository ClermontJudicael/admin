// src/CustomMenu.tsx
import { Menu, MenuItemLink } from "react-admin";
import { Dashboard } from "@mui/icons-material"; // Importez l'icône du tableau de bord
import EventIcon from "@mui/icons-material/Event"; // Icône pour les événements
import TicketIcon from "@mui/icons-material/ConfirmationNumber"; // Icône pour les tickets
import UserIcon from "@mui/icons-material/People"; // Icône pour les utilisateurs
import ReservationIcon from "@mui/icons-material/Book"; // Icône pour les réservations

const CustomMenu = (props: any) => (
  <Menu {...props}>
    <MenuItemLink to="/dashboard" primaryText="Dashboard" leftIcon={<Dashboard />} />
    <MenuItemLink to="/events" primaryText="Events" leftIcon={<EventIcon />} />
    <MenuItemLink to="/tickets" primaryText="Tickets" leftIcon={<TicketIcon />} />
    <MenuItemLink to="/users" primaryText="Users" leftIcon={<UserIcon />} />
    <MenuItemLink to="/reservations" primaryText="Reservations" leftIcon={<ReservationIcon />} />
  </Menu>
);

export default CustomMenu;
