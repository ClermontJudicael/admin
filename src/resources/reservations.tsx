// src/resources/reservations.tsx
import { 
  List, Datagrid, TextField, DateField, EditButton, DeleteButton, BooleanField,
  ReferenceField, NumberField, Show, SimpleShowLayout, ReferenceInput, 
  SelectInput, Filter, CreateButton, Button, useRecordContext, useNotify,
  useRefresh
} from "react-admin";
import CancelIcon from '@mui/icons-material/Cancel';

const ReservationFilter = (props) => (
  <Filter {...props}>
    <ReferenceInput source="event_id" reference="events" label="Événement">
      <SelectInput optionText="title" />
    </ReferenceInput>
    <SelectInput 
      source="status" 
      choices={[
        { id: 'confirmed', name: 'Confirmée' },
        { id: 'canceled', name: 'Annulée' },
      ]} 
    />
  </Filter>
);

const CancelReservationButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();

  const handleClick = async () => {
    try {
      const response = await fetch(`/reservations/${record.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      notify('Réservation annulée avec succès', { type: 'success' });
      refresh();
    } catch (error) {
      notify(`Erreur lors de l'annulation: ${error.message}`, { type: 'error' });
    }
  };

  return (
    <Button 
      label="Annuler" 
      onClick={handleClick} 
      disabled={record?.status === 'canceled'}
      startIcon={<CancelIcon />}
    />
  );
};

export const ReservationList = () => (
  <List filters={<ReservationFilter />}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <ReferenceField source="user_id" reference="users" link="show">
        <TextField source="username" />
      </ReferenceField>
      <ReferenceField source="ticket_id" reference="tickets" link="show">
        <TextField source="type" />
      </ReferenceField>
      <NumberField source="quantity" />
      <TextField source="status" />
      <DateField source="created_at" />
      <CancelReservationButton />
    </Datagrid>
  </List>
);

export const ReservationShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <ReferenceField source="user_id" reference="users">
        <TextField source="username" />
      </ReferenceField>
      <ReferenceField source="ticket_id" reference="tickets">
        <TextField source="type" />
      </ReferenceField>
      <NumberField source="quantity" />
      <TextField source="status" />
      <DateField source="created_at" />
      {record => (
        record.ticket_details && record.event_details && (
          <>
            <TextField source="ticket_details.type" label="Type de billet" />
            <NumberField source="ticket_details.price" label="Prix unitaire" />
            <TextField source="event_details.title" label="Événement" />
            <DateField source="event_details.date" label="Date de l'événement" />
            <TextField source="event_details.location" label="Lieu" />
          </>
        )
      )}
    </SimpleShowLayout>
  </Show>
);

export default {
  list: ReservationList,
  show: ReservationShow
};
