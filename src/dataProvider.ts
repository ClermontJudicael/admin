
import simpleRestProvider from 'ra-data-simple-rest';
import { fetchUtils } from 'react-admin';

// L'URL de l'API admin
const apiUrl = 'http://localhost:5000/api';

// Fonction de connexion pour obtenir un JWT
const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${apiUrl}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: username, // Utiliser email au lieu de username pour la nouvelle API
        password: password,
      }),
    });

    if (!response.ok) {
      console.error('Erreur de connexion:', response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    if (data.token) {
      // Stocker toutes les informations nécessaires
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('auth', JSON.stringify(data)); // Stocker l'objet complet
      
      console.log('Connexion réussie, rôle:', data.user.role);
      
      // Vérifier que l'utilisateur est un admin
      if (data.user.role !== 'admin') {
        console.error('Accès non autorisé: rôle non-admin');
        // Nettoyer le localStorage si l'utilisateur n'est pas admin
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('auth');
        return false;
      }
      
      return true;
    } else {
      console.error('Token manquant dans la réponse');
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return false;
  }
};

// Utiliser le client HTTP de react-admin avec notre logique d'authentification
// Modifier la fonction httpClient pour mieux gérer les erreurs
const httpClient = (url: string, options: fetchUtils.Options = {}) => {
const token = localStorage.getItem('token');

if (!options.headers) {
  options.headers = new Headers({ Accept: 'application/json' });
}

if (token) {
  (options.headers as Headers).set('Authorization', `Bearer ${token}`);
}

return fetchUtils.fetchJson(url, options)
  .catch(async (error) => {
    console.error('Erreur API:', error);
    
    // Récupérer le message d'erreur du body si disponible
    let errorMessage = 'Erreur inconnue';
    try {
      const errorBody = await error.json();
      errorMessage = errorBody.message || error.message;
    } catch (e) {
      errorMessage = error.message;
    }

    // Si erreur d'authentification, nettoyer le localStorage
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      localStorage.removeItem('auth');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Créer une nouvelle erreur avec le message formaté
    const formattedError = new Error(errorMessage);
    (formattedError as any).status = error.status;
    throw formattedError;
  });
};


const checkToken = async (): Promise<boolean> => {
const token = localStorage.getItem('token');

if (!token) {
  return false;
}

try {
  const response = await fetch(`${apiUrl}/admin/check-auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });
  
  if (!response.ok) {
    // Nettoyer le localStorage si le token n'est plus valide
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('auth');
    return false;
  }
  
  const data = await response.json();
  return data.valid && data.user && data.user.role === 'admin';
} catch (error) {
  console.error('Erreur lors de la vérification du token:', error);
  return false;
}
};
// DataProvider de base
const baseDataProvider = simpleRestProvider(apiUrl, httpClient);

// DataProvider personnalisé avec gestion améliorée
const dataProvider = {
  ...baseDataProvider,
  
  getList: (resource, params) => {
    return baseDataProvider.getList(resource, params)
      .catch(error => {
        console.error(`Erreur lors de la récupération des ${resource}:`, error);
        throw error;
      });
  },

  getOne: (resource, params) => {
    return baseDataProvider.getOne(resource, params)
      .catch(error => {
        console.error(`Erreur lors de la récupération de ${resource}/${params.id}:`, error);
        throw error;
      });
  },

  update: async (resource, params) => {
    // Cas spécial pour l'annulation de réservation
    if (resource === 'reservations' && params.data.status === 'canceled') {
      try {
        const { json } = await httpClient(`${apiUrl}/${resource}/${params.id}/cancel`, {
          method: 'PUT',
          body: JSON.stringify(params.data),
        });
        return { data: { id: params.id, ...json } };
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error);
        throw error;
      }
    }
    
    // Comportement normal pour les autres updates
    try {
      const url = `${apiUrl}/${resource}/${params.id}`;
      console.log('Tentative de mise à jour sur:', url); // Debug
      
      const { json } = await httpClient(url, {
        method: 'PUT',
        body: JSON.stringify(params.data),
      });
      
      return { 
        data: { 
          id: params.id, 
          ...(json.data || json) 
        } 
      };
    } catch (error) {
      console.error('Erreur détaillée lors de la mise à jour:', {
        resource,
        id: params.id,
        error: error.message,
        status: error.status,
      });
      
      if (error.status === 404) {
        throw new Error(`La ressource ${resource}/${params.id} n'existe pas ou l'endpoint n'est pas configuré`);
      }
      
      throw error;
    }
  },

  create: async (resource, params) => {
    try {
        // Effectuer la requête POST pour créer une nouvelle ressource
        const { json } = await httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data), // Envoyer les données de l'événement
        });
        
        console.log('Response from create:', json);
        
        if (!json.data || !json.data.id) {
            throw new Error('La réponse de l\'API ne contient pas de champ "id".');
        }

        // Retourner la réponse au format attendu par React Admin
        return { data: json.data }; 
    } catch (error) {
        console.error(`Erreur lors de la création de ${resource}:`, error);
        throw error; 
    }
},


  delete: (resource, params) => {
    return baseDataProvider.delete(resource, params)
      .catch(error => {
        console.error(`Erreur lors de la suppression de ${resource}/${params.id}:`, error);
        throw error;
      });
  }
};


export { login, checkToken, dataProvider }; 
