/**
// src/authProvider.ts
const authProvider = {
    login: ({ username, password }: { username: string; password: string }) => {
      return fetch("http://localhost:5000/api/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Identifiants invalides');
          }
          return response.json();
        })
        .then((data) => {
          if (!data.token) {
            throw new Error('Le serveur n\'a pas renvoyé de token');
          }
          
          // Vérification du rôle : seuls les admins sont autorisés
          if (data.role !== 'admin') {
            throw new Error('Accès non autorisé. Seuls les administrateurs peuvent accéder à ce tableau de bord.');
          }
          
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);
          localStorage.setItem("username", data.username);
          return Promise.resolve();
        })
        .catch((error) => {
          console.error('Erreur de connexion:', error);
          return Promise.reject(error);
        });
    },
    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      return Promise.resolve();
    },
    checkAuth: () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      
      // Vérifier à la fois le token et le rôle
      if (!token) {
        return Promise.reject({ message: 'Non authentifié' });
      }
      
      // Vérifier que l'utilisateur est bien un admin
      if (role !== 'admin') {
        return Promise.reject({ message: 'Accès non autorisé. Seuls les administrateurs peuvent accéder à ce tableau de bord.' });
      }
      
      return Promise.resolve();
    },
    checkError: (error: any) => {
      const status = error.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        return Promise.reject({ message: 'Non autorisé' });
      }
      return Promise.resolve();
    },
    getPermissions: () => {
      const role = localStorage.getItem("role");
      
      // Ne permettre que le rôle admin
      if (role !== 'admin') {
        return Promise.reject('Non autorisé');
      }
      
      return Promise.resolve(role);
    },
    getIdentity: () => {
      const username = localStorage.getItem("username");
      const role = localStorage.getItem("role");
      
      if (!username || role !== 'admin') {
        return Promise.reject('Non autorisé');
      }
      
      return Promise.resolve({ id: 'admin', fullName: username });
    }
  };
  
  export default authProvider;













-----------------------------------------------------------
*/
const authProvider = {
  login: ({ username, password }: { username: string; password: string }) => {
    // Utiliser la nouvelle route d'authentification admin
    return fetch("http://localhost:5000/api/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email: username, password }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Identifiants invalides');
        }
        return response.json();
      })
      .then((data) => {
        if (!data.token) {
          throw new Error('Le serveur n\'a pas renvoyé de token');
        }
        
        // Vérification que l'utilisateur a bien le rôle admin
        if (!data.user || data.user.role !== 'admin') {
          throw new Error('Accès non autorisé. Seuls les administrateurs peuvent accéder à ce tableau de bord.');
        }
        
        // Stocker les informations complètes d'authentification
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("auth", JSON.stringify(data)); // Stocker l'objet complet pour getIdentity
        
        return Promise.resolve();
      })
      .catch((error) => {
        console.error('Erreur de connexion:', error);
        return Promise.reject(error);
      });
  },
  
  logout: () => {
    const token = localStorage.getItem("token");
    
    // Notifier le serveur de la déconnexion si un token est présent
    if (token) {
      fetch("http://localhost:5000/api/auth/admin/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }).catch(() => {
        // Ignorer les erreurs de déconnexion
      });
    }
    
    // Supprimer toutes les données d'authentification
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("auth");
    
    return Promise.resolve();
  },
  
  checkAuth: () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      return Promise.reject({ message: 'Non authentifié' });
    }
    
    // Vérifier la validité du token côté serveur et que l'utilisateur est toujours admin
    return fetch("http://localhost:5000/api/auth/admin/check-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Token invalide ou expiré');
        }
        return response.json();
      })
      .then(data => {
        if (!data.valid || !data.user || data.user.role !== 'admin') {
          throw new Error('Accès non autorisé');
        }
        return Promise.resolve();
      })
      .catch(error => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        localStorage.removeItem("auth");
        return Promise.reject({ message: error.message || 'Session invalide' });
      });
  },
  
  checkError: (error: any) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("auth");
      return Promise.reject({ message: 'Non autorisé' });
    }
    return Promise.resolve();
  },
  
  getPermissions: () => {
    const role = localStorage.getItem("role");
    
    // Ne permettre que le rôle admin
    if (role !== 'admin') {
      return Promise.reject('Non autorisé');
    }
    
    return Promise.resolve(role);
  },
  
  getIdentity: () => {
    const auth = JSON.parse(localStorage.getItem("auth") || '{}');
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    
    if (!username || role !== 'admin' || !auth.user) {
      return Promise.reject('Non autorisé');
    }
    
    return Promise.resolve({
      id: auth.user.id || 'admin',
      fullName: auth.user.username || username,
      email: auth.user.email,
      avatar: null
    });
  }
};

export default authProvider; 
  