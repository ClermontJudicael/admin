import { 
    List, Datagrid, TextField, DateField, EditButton, DeleteButton, 
    Create, SimpleForm, TextInput, DateInput, Edit, SelectInput,
    ImageField, ImageInput, ReferenceField, Filter, SearchInput,
    Show, SimpleShowLayout, TabbedShowLayout, Tab, ReferenceManyField,
    Button, useRecordContext
  } from "react-admin";
import PublishIcon from '@mui/icons-material/Publish';
import DraftsIcon from '@mui/icons-material/Drafts';
import CancelIcon from '@mui/icons-material/Cancel';

// Filtre pour les événements
const EventFilter = (props) => (
  <Filter {...props}>
    <SearchInput source="title" alwaysOn />
    <SelectInput 
      source="status" 
      choices={[
        { id: 'draft', name: 'Brouillon' },
        { id: 'published', name: 'Publié' },
        { id: 'canceled', name: 'Annulé' },
      ]} 
    />
    <SelectInput 
      source="category" 
      choices={[
        { id: 'concert', name: 'Concert' },
        { id: 'sport', name: 'Sport' },
        { id: 'theatre', name: 'Théâtre' },
        { id: 'exposition', name: 'Exposition' },
        { id: 'conference', name: 'Conférence' },
      ]} 
    />
  </Filter>
);

// Boutons d'action pour changer le statut d'un événement
const StatusActions = () => {
  const record = useRecordContext();
  
  if (!record) return null;
  
  const changeStatus = async (newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/events/${record.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      // Rafraîchir la page après changement de statut
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert(`Erreur lors du changement de statut: ${error.message}`);
    }
  };
  
  return (
    <>
      {record.status !== 'published' && (
        <Button
          label="Publier"
          onClick={() => changeStatus('published')}
          startIcon={<PublishIcon />}
        />
      )}
      {record.status !== 'draft' && (
        <Button
          label="Brouillon"
          onClick={() => changeStatus('draft')}
          startIcon={<DraftsIcon />}
        />
      )}
      {record.status !== 'canceled' && (
        <Button
          label="Annuler"
          onClick={() => changeStatus('canceled')}
          startIcon={<CancelIcon />}
          color="error"
        />
      )}
    </>
  );
};
  
export const EventList = () => (
  <List filters={<EventFilter />}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="description" label="Description" />
      <DateField source="date" showTime />
      <TextField source="location" />
      <TextField source="category" />
      <TextField source="status" />
      <ImageField source="image_url" title="image_alt" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const EventShow = () => (
  <Show>
    <TabbedShowLayout>
      <Tab label="Résumé">
        <TextField source="title" />
        <TextField source="description" />
        <DateField source="date" showTime />
        <TextField source="location" />
        <TextField source="category" />
        <TextField source="status" />
        <ImageField source="image_url" title="image_alt" />
        <StatusActions />
      </Tab>
      <Tab label="Billets" path="tickets">
        <ReferenceManyField reference="tickets" target="event_id" label="Types de billets">
          <Datagrid>
            <TextField source="type" />
            <TextField source="price" />
            <TextField source="available_quantity" />
            <TextField source="purchase_limit" />
            <TextField source="is_active" />
            <EditButton />
          </Datagrid>
        </ReferenceManyField>
      </Tab>
      <Tab label="Réservations" path="reservations">
        <ReferenceManyField reference="reservations" target="event_id" label="Réservations">
          <Datagrid>
            <TextField source="id" />
            <ReferenceField source="user_id" reference="users">
              <TextField source="username" />
            </ReferenceField>
            <TextField source="quantity" />
            <TextField source="status" />
            <DateField source="created_at" />
          </Datagrid>
        </ReferenceManyField>
      </Tab>
    </TabbedShowLayout>
  </Show>
);
  
export const EventCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" required fullWidth />
      <TextInput source="description" multiline rows={5} required fullWidth />
      <DateInput source="date" required />
      <TextInput source="location" required />
      <SelectInput 
        source="category" 
        choices={[
          { id: 'concert', name: 'Concert' },
          { id: 'sport', name: 'Sport' },
          { id: 'theatre', name: 'Théâtre' },
          { id: 'exposition', name: 'Exposition' },
          { id: 'conference', name: 'Conférence' },
        ]} 
        required 
      />
      <SelectInput 
        source="status" 
        choices={[
          { id: 'draft', name: 'Brouillon' },
          { id: 'published', name: 'Publié' },
          { id: 'canceled', name: 'Annulé' },
        ]} 
        defaultValue="draft"
        required 
      />
      <ImageInput source="image" label="Image de l'événement" accept="image/*">
        <ImageField source="src" title="title" />
      </ImageInput>
      <TextInput source="image_alt" label="Description de l'image" />
    </SimpleForm>
  </Create>
);
  
export const EventEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" required fullWidth />
      <TextInput source="description" multiline rows={5} required fullWidth />
      <DateInput source="date" required />
      <TextInput source="location" required />
      <SelectInput 
        source="category" 
        choices={[
          { id: 'concert', name: 'Concert' },
          { id: 'sport', name: 'Sport' },
          { id: 'theatre', name: 'Théâtre' },
          { id: 'exposition', name: 'Exposition' },
          { id: 'conference', name: 'Conférence' },
        ]} 
        required 
      />
      <SelectInput 
        source="status" 
        choices={[
          { id: 'draft', name: 'Brouillon' },
          { id: 'published', name: 'Publié' },
          { id: 'canceled', name: 'Annulé' },
        ]}
        required 
      />
      <ImageInput source="image" label="Image de l'événement" accept="image/*">
        <ImageField source="src" title="title" />
      </ImageInput>
      <TextInput source="image_alt" label="Description de l'image" />
    </SimpleForm>
  </Edit>
);
  
export default {
  list: EventList,
  create: EventCreate,
  edit: EventEdit,
  show: EventShow,
};
  