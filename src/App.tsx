// src/App.tsx
import { Admin, Resource } from "react-admin";
import authProvider from "./authProvider";
import events from "./resources/events";
import tickets from "./resources/tickets";
import users from "./resources/users";
import reservations from "./resources/reservations";
import { dataProvider } from "./dataProvider"; // Utiliser le dataProvider personnalisé
import CustomLayout from "./Layout";
import Dashboard from "./components/Dashboard";

const App = () => (
  <Admin dataProvider={dataProvider} authProvider={authProvider} layout={CustomLayout} dashboard={Dashboard}>
    <Resource name="dashboard" list={Dashboard} />
    <Resource name="events" {...events} />
    <Resource name="tickets" {...tickets} />
    <Resource name="users" {...users} />
    <Resource name="reservations" {...reservations} />
  </Admin>
);

export default App;