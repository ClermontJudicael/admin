// src/resources/users.tsx
import { 
  List, Datagrid, TextField, EmailField, EditButton, DeleteButton, 
  Create, SimpleForm, TextInput, Edit, SelectInput,
  PasswordInput, Filter
} from "react-admin";

const UserFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Rechercher" source="q" alwaysOn />
    <SelectInput 
      source="role" 
      choices={[
        { id: 'admin', name: 'Admin' },
        { id: 'organizer', name: 'Organisateur' },
        { id: 'user', name: 'Utilisateur' },
      ]} 
    />
  </Filter>
);

export const UserList = () => (
  <List filters={<UserFilter />}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="username" />
      <EmailField source="email" />
      <TextField source="role" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const UserCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="username" required />
      <TextInput source="email" type="email" required />
      <PasswordInput source="password" required />
      <SelectInput 
        source="role" 
        choices={[
          { id: 'admin', name: 'Admin' },
          { id: 'organizer', name: 'Organisateur' },
          { id: 'user', name: 'Utilisateur' },
        ]} 
        defaultValue="user"
        required 
      />
    </SimpleForm>
  </Create>
);

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="username" required />
      <TextInput source="email" type="email" required />
      <SelectInput 
        source="role" 
        choices={[
          { id: 'admin', name: 'Admin' },
          { id: 'organizer', name: 'Organisateur' },
          { id: 'user', name: 'Utilisateur' },
        ]} 
        required 
      />
    </SimpleForm>
  </Edit>
);

export default {
  list: UserList,
  create: UserCreate,
  edit: UserEdit,
};
