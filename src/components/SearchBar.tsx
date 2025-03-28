// src/components/SearchBar.tsx
import { TextField } from '@mui/material';

const SearchBar = () => {
    return (
        <TextField
            variant="outlined"
            placeholder="Search..."
            size="small"
            style={{ width: '24%' }} // Définissez une largeur en pourcentage
            
        />
    );
};
export default SearchBar;
