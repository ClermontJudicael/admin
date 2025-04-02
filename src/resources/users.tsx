// src/resources/users.tsx
import { 
  List, Datagrid, TextField, EmailField, EditButton, DeleteButton, 
  Create, SimpleForm, TextInput, Edit, SelectInput,
  PasswordInput, Filter, useNotify,
  FunctionField
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

export const UserList = () => {
  
  const notify = useNotify();
  
  const handleDeleteError = (error: any) => {
    notify(
      typeof error === 'string' 
        ? error 
        : error?.message || 'Erreur lors de la suppression',
      { type: 'error' }
    );
  };

  return (
    <List filters={<UserFilter />}>
      <Datagrid>
        <TextField source="id" />
        <TextField source="username" />
        <EmailField source="email" />
        <FunctionField
          source="role"
          render={(record) => (
            <span style={{
              color: record.role === 'admin' ? '#d32f2f' : 'inherit',
              fontWeight: record.role === 'admin' ? 'bold' : 'normal'
            }}>
              {record.role}
            </span>
          )}
        />
        <EditButton />
        <DeleteButton mutationOptions={{ onError: handleDeleteError }} />
      </Datagrid>
    </List>
  );
};

export const UserEdit = () => {
  const notify = useNotify();

  const handleEditError = (error: any) => {
    notify(
      typeof error === 'string' 
        ? error 
        : error?.message || 'Erreur lors de la modification',
      { type: 'error' }
    );
  };

  return (
    <Edit mutationOptions={{ onError: handleEditError }}>
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
};

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

export default {
  list: UserList,
  create: UserCreate,
  edit: UserEdit,
};