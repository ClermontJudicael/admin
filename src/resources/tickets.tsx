// src/resources/tickets.tsx
import { 
  List, Datagrid, TextField, EditButton, DeleteButton, 
  Create, SimpleForm, TextInput, Edit, BooleanField, BooleanInput,
  NumberInput, ReferenceField, ReferenceInput, SelectInput
} from "react-admin";

export const TicketList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <ReferenceField source="event_id" reference="events" link="show">
        <TextField source="title" />
      </ReferenceField>
      <TextField source="type" />
      <TextField source="price" />
      <TextField source="available_quantity" />
      <TextField source="purchase_limit" />
      <BooleanField source="is_active" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const TicketCreate = () => (
  <Create>
    <SimpleForm>
      <ReferenceInput source="event_id" reference="events">
        <SelectInput optionText="title" />
      </ReferenceInput>
      <SelectInput 
        source="type" 
        choices={[
          { id: 'VIP', name: 'VIP' },
          { id: 'Standard', name: 'Standard' },
          { id: 'Early Bird', name: 'Early Bird' },
        ]} 
        required 
      />
      <NumberInput source="price" required min={0} />
      <NumberInput source="available_quantity" required min={0} />
      <NumberInput source="purchase_limit" required min={1} defaultValue={10} />
      <BooleanInput source="is_active" defaultValue={true} />
    </SimpleForm>
  </Create>
);

export const TicketEdit = () => (
  <Edit>
    <SimpleForm>
      <ReferenceInput source="event_id" reference="events">
        <SelectInput optionText="title" disabled />
      </ReferenceInput>
      <SelectInput 
        source="type" 
        choices={[
          { id: 'VIP', name: 'VIP' },
          { id: 'Standard', name: 'Standard' },
          { id: 'Early Bird', name: 'Early Bird' },
        ]} 
        required 
      />
      <NumberInput source="price" required min={0} />
      <NumberInput source="available_quantity" required min={0} />
      <NumberInput source="purchase_limit" required min={1} />
      <BooleanInput source="is_active" />
    </SimpleForm>
  </Edit>
);

export default {
  list: TicketList,
  create: TicketCreate,
  edit: TicketEdit,
};
