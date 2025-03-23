import { Headers, RequestInit, Response } from 'node-fetch'; // Si vous utilisez Node.js
// ou
// import { Headers, RequestInit, Response } from 'whatwg-fetch'; // Si vous utilisez un polyfill pour le navigateur

interface HttpClientOptions extends RequestInit {
  headers?: Headers;
}

const httpClient = async (url: string, options: HttpClientOptions = {}): Promise<Response> => {
  // Initialiser les en-têtes si non définis
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }

  // Ajouter le token d'authentification s'il existe
  const token = localStorage.getItem('token');
  if (token) {
    options.headers.set('Authorization', `Bearer ${token}`);
  }

  // Effectuer la requête fetch
  return fetch(url, options);
};

export default httpClient;