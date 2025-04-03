import { Headers, RequestInit, Response } from 'node-fetch'; // Si vous utilisez Node.js


interface HttpClientOptions extends RequestInit {
  headers?: Headers;
}

const httpClient = async (url: string, options: HttpClientOptions = {}): Promise<Response> => {
  // Clone profond des options pour éviter les mutations
  const finalOptions = { 
    ...options,
    headers: new Headers(options.headers || {})
  };

  // Headers communs à toutes les requêtes
  finalOptions.headers.set('Accept', 'application/json');

  // Ajout du token JWT si disponible
  const token = localStorage.getItem('token');
  if (token) {
    finalOptions.headers.set('Authorization', `Bearer ${token}`);
  }

  // Gestion intelligente du Content-Type
  if (options.body instanceof FormData) {
    // Cas 1: FormData (upload de fichier)
    // On laisse le navigateur gérer automatiquement le Content-Type et la boundary
    finalOptions.headers.delete('Content-Type');
  } else if (options.body) {
    // Cas 2: Corps JSON
    if (!finalOptions.headers.has('Content-Type')) {
      finalOptions.headers.set('Content-Type', 'application/json');
    }
    if (typeof finalOptions.body !== 'string') {
      finalOptions.body = JSON.stringify(finalOptions.body);
    }
  }
  // Cas 3: Pas de body (requêtes GET) - ne rien faire

  // Gestion améliorée des réponses
  try {
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || response.statusText);
      (error as any).status = response.status;
      throw error;
    }

    return response;
  } catch (error) {
    console.error('Erreur httpClient:', {
      url,
      error: error.message,
      status: error.status
    });
    throw error;
  }
};

export default httpClient;