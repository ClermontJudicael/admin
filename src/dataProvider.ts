
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

  // Vérifie si les headers sont déjà définis, sinon on les initialise
  if (!options.headers) {
    options.headers = new Headers(); // Crée un nouvel objet Headers
  }

  // Ajoute un en-tête Accept si non existant
  if (!(options.headers instanceof Headers)) {
    options.headers = new Headers(options.headers); // Convertit en Headers si ce n'est pas déjà le cas
  }

  // Ajoute le token d'autorisation si disponible
  if (token) {
    options.headers.set('Authorization', `Bearer ${token}`);
  } else {
    console.warn('Aucun token trouvé, l\'authentification peut échouer.');
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
        if (resource === 'events' && params.data.image) {
            console.log("Fichier reçu dans create:", params.data.image);

            const formData = new FormData();

            // Ajout des autres champs
            Object.keys(params.data).forEach(key => {
                if (key !== 'image' && params.data[key] !== undefined) {
                    formData.append(key, params.data[key]);
                }
            });

            // Vérification et ajout de l'image
            if (params.data.image.rawFile instanceof File) {
                console.log("Ajout du fichier dans FormData:", params.data.image.rawFile);
                formData.append('image', params.data.image.rawFile, params.data.image.title || params.data.image.rawFile.name);
            } else {
                console.error("L'image reçue n'est pas un fichier valide !");
                return Promise.reject(new Error("L'image n'est pas un fichier valide."));
            }

            // Envoi de la requête
            const response = await fetch(`${apiUrl}/${resource}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const json = await response.json();
            console.log("Réponse du backend :", json);

            // Format de réponse standard pour React-Admin
            return { 
                data: { 
                    id: json.data?.id || json.id, // Prendre l'ID soit de json.data soit directement de json
                    ...(json.data || json) // Étendre avec toutes les données
                } 
            };
        }

        // Comportement pour les autres ressources
        const { json } = await httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
            headers: { 'Content-Type': 'application/json' },
        });

        // Format de réponse standard pour React-Admin
        return { 
            data: { 
                id: json.data?.id || json.id, // Prendre l'ID soit de json.data soit directement de json
                ...(json.data || json) // Étendre avec toutes les données
            } 
        };
    } catch (error) {
        console.error(`Erreur lors de la création de ${resource}:`, error);
        throw error;
    }
},


delete: async (resource, params) => {
  try {
      // Effectuer la requête DELETE pour supprimer la ressource
      const response = await httpClient(`${apiUrl}/${resource}/${params.id}`, {
          method: 'DELETE',
      });

      // Vérifiez le code de statut de la réponse
      if (response.status === 204) {
          // Si la réponse est 204, cela signifie que la suppression a réussi
          return { data: { id: params.id } }; // Retourner l'id de la ressource supprimée
      }

      // Si votre API renvoie un corps, vous pouvez le traiter ici
      const json = await response.json();
      console.log('Response from delete:', json);
      return { data: json.data || { id: params.id } }; // Retourner l'id de la ressource supprimée
  } catch (error) {
      console.error(`Erreur lors de la suppression de ${resource}/${params.id}:`, error);
      throw error; // Propager l'erreur pour que React Admin puisse la gérer
  }
},

};


export { login, checkToken, dataProvider }; 
