import { fetchUtils } from 'react-admin';
import { stringify } from 'query-string';

const apiUrl = 'http://localhost:5000/api';

const httpClient = async (url: string, options: fetchUtils.Options = {}) => {
    const token = localStorage.getItem('token');
    const headers = new Headers({
        Accept: 'application/json',
        'Content-Type': options.headers?.get('Content-Type') || 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    });

    try {
        const response = await fetchUtils.fetchJson(url, {
            ...options,
            headers,
        });

        // Normalisation de la réponse
        if (response.json.data !== undefined) {
            return response; // Déjà au bon format
        }
        return {
            ...response,
            json: { data: response.json }
        };

    } catch (error) {
        console.error('API Error:', error);
        if (error.status === 401) {
            localStorage.removeItem('token');
            window.location.reload();
        }
        throw error;
    }
};

export const dataProvider = {
    getList: async (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;
        
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify(params.filter),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;

        const { json, headers } = await httpClient(url);
        
        // Vérification du format
        if (!Array.isArray(json.data)) {
            throw new Error(`Format de réponse invalide. Attendu: { data: [...] }, Reçu: ${JSON.stringify(json)}`);
        }

        return {
            data: json.data,
            total: parseInt(headers.get('content-range')?.split('/').pop() || json.data.length, 10)
        };
    },

    getOne: async (resource, params) => {
        const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`);
        return { data: json.data };
    },

    create: async (resource, params) => {
        const { json } = await httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        });
        
        if (!json.data?.id) {
            throw new Error('La réponse de création ne contient pas d\'ID');
        }
        
        return { 
            data: { 
                ...json.data, 
                id: json.data.id.toString() 
            } 
        };
    },

    update: async (resource, params) => {
        const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        });
        return { data: json.data };
    },

    delete: async (resource, params) => {
        const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
        });
        return { data: json.data };
    },

    updateStatus: async (resource, params) => {
        const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: params.data.status }),
        });
        return { data: json.data };
    },

    uploadImage: async (resource, params) => {
        const formData = new FormData();
        formData.append('image', params.data.file);
        
        const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}/image`, {
            method: 'POST',
            body: formData,
            headers: new Headers({
                // Pas de Content-Type pour FormData, le navigateur le fera automatiquement
                Authorization: `Bearer ${localStorage.getItem('token')}`
            })
        });
        return { data: json.data };
    }
};