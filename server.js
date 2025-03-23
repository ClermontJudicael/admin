import express from 'express';  // Correct syntax for ES modules
import jwt from 'jsonwebtoken';  // Correct syntax for ES modules
import bcrypt from 'bcryptjs';  // Correct syntax for ES modules
import cors from 'cors';  // Correct syntax for ES modules
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();

// Get current directory (replacement for __dirname in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware pour parser les données JSON
app.use(express.json());

// Middleware CORS pour autoriser les requêtes depuis un autre domaine
app.use(cors({
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
}));

// Créer un dossier pour les images uploadées s'il n'existe pas
const uploadDir = path.join(__dirname, 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration de Multer pour gérer les uploads d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limite à 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Le fichier doit être une image'), false);
    }
  }
});

// Servir les fichiers statiques du dossier uploads
app.use('/images', express.static(uploadDir));

// Secret pour JWT
const JWT_SECRET = 'your-secret-key';

// ====== DONNÉES TEMPORAIRES (à remplacer par une vraie BDD) ======
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: 'radokely', // 'password'
    role: 'admin'
  },
  {
    id: 2,
    username: 'organizer',
    email: 'organizer@example.com',
    password: 'organisateur', // 'password'
    role: 'organizer'
  },
  {
    id: 3,
    username: 'user',
    email: 'user@example.com',
    password: 'user', // 'password'
    role: 'user'
  }
];

const events = [
  {
    id: 1,
    title: 'Concert de Jazz',
    description: 'Un super concert de jazz avec les meilleurs artistes',
    date: '2024-04-01T20:00:00',
    location: 'Salle de Concert',
    category: 'concert',
    organizer_id: 2,
    image_url: '/images/events/jazz.jpg',
    image_alt: 'Concert de jazz',
    status: 'published'
  },
  {
    id: 2,
    title: 'Match de Football',
    description: 'Finale du championnat local de football',
    date: '2024-05-15T15:00:00',
    location: 'Stade Municipal',
    category: 'sport',
    organizer_id: 2,
    image_url: '/images/events/foot.jpg',
    image_alt: 'Match de football',
    status: 'published'
  }
];

const tickets = [
  {
    id: 1,
    event_id: 1,
    type: 'VIP',
    price: 100.00,
    available_quantity: 50,
    purchase_limit: 2,
    is_active: true
  },
  {
    id: 2,
    event_id: 1,
    type: 'Standard',
    price: 50.00,
    available_quantity: 100,
    purchase_limit: 5,
    is_active: true
  },
  {
    id: 3,
    event_id: 2,
    type: 'Early Bird',
    price: 30.00,
    available_quantity: 200,
    purchase_limit: 10,
    is_active: true
  }
];

const reservations = [
  {
    id: 1,
    user_id: 3,
    ticket_id: 1,
    quantity: 2,
    status: 'confirmed',
    created_at: '2024-03-15T10:30:00'
  },
  {
    id: 2,
    user_id: 3,
    ticket_id: 3,
    quantity: 4,
    status: 'confirmed',
    created_at: '2024-03-16T14:45:00'
  }
];

// ====== MIDDLEWARE D'AUTHENTIFICATION ======
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentification requise' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    // Ajouter des logs pour le débogage
    console.log('Token décodé:', decoded);
    console.log('Utilisateur authentifié:', req.user);
    
    next();
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return res.status(403).json({ message: 'Token invalide', error: error.message });
  }
};

// ====== ROUTES D'AUTHENTIFICATION ======
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  console.log('Tentative de connexion:', username);

  const user = users.find(u => u.username === username);

  if (!user) {
    console.log('Utilisateur non trouvé:', username);
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  try {
    // Vérifier si le mot de passe est en clair ou hashé
    let isPasswordValid = false;
    
    if (user.password.startsWith('$2a$')) {
      // Le mot de passe est hashé avec bcrypt
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Le mot de passe est en clair
      isPasswordValid = (password === user.password);
    }
    
    if (!isPasswordValid) {
      console.log('Mot de passe invalide pour:', username);
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    console.log('Connexion réussie pour:', username);
    
    const token = jwt.sign({ 
      id: user.id, 
      username: user.username,
      role: user.role 
    }, JWT_SECRET, { expiresIn: '1h' });
    
    return res.json({ 
      token, 
      id: user.id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// ====== ROUTES POUR LES ÉVÉNEMENTS ======
// Liste de tous les événements
app.get('/events', (req, res) => {
  res.set('Content-Range', `events 0-${events.length-1}/${events.length}`);
  res.set('X-Total-Count', events.length);
  res.json(events);
});

// Détail d'un événement
app.get('/events/:id', (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));
  if (!event) {
    return res.status(404).json({ message: 'Événement non trouvé' });
  }
  res.json(event);
});

// Créer un événement
app.post('/events', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  const newEvent = {
    id: events.length + 1,
    ...req.body,
    organizer_id: req.user.id,
    status: req.body.status || 'draft'
  };
  
  events.push(newEvent);
  res.status(201).json(newEvent);
});

// Modifier un événement
app.put('/events/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  const eventId = parseInt(req.params.id);
  const eventIndex = events.findIndex(e => e.id === eventId);
  
  if (eventIndex === -1) {
    return res.status(404).json({ message: 'Événement non trouvé' });
  }
  
  // Vérifier si l'utilisateur est l'organisateur de l'événement
  if (req.user.role === 'organizer' && events[eventIndex].organizer_id !== req.user.id) {
    return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres événements' });
  }
  
  events[eventIndex] = {
    ...events[eventIndex],
    ...req.body,
    id: eventId // Conserver l'ID original
  };
  
  res.json(events[eventIndex]);
});

// Supprimer un événement
app.delete('/events/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  const eventId = parseInt(req.params.id);
  const eventIndex = events.findIndex(e => e.id === eventId);
  
  if (eventIndex === -1) {
    return res.status(404).json({ message: 'Événement non trouvé' });
  }
  
  // Vérifier si l'utilisateur est l'organisateur de l'événement
  if (req.user.role === 'organizer' && events[eventIndex].organizer_id !== req.user.id) {
    return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres événements' });
  }
  
  events.splice(eventIndex, 1);
  res.status(204).send();
});

// Route pour changer le statut d'un événement
app.put('/events/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  const eventId = parseInt(req.params.id);
  const { status } = req.body;
  
  if (!status || !['draft', 'published', 'canceled'].includes(status)) {
    return res.status(400).json({ message: 'Statut invalide. Doit être: draft, published ou canceled' });
  }
  
  const eventIndex = events.findIndex(e => e.id === eventId);
  
  if (eventIndex === -1) {
    return res.status(404).json({ message: 'Événement non trouvé' });
  }
  
  // Si l'utilisateur est un organisateur, vérifier que c'est son événement
  if (req.user.role === 'organizer' && events[eventIndex].organizer_id !== req.user.id) {
    return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres événements' });
  }
  
  // Mettre à jour le statut
  events[eventIndex].status = status;
  
  res.json(events[eventIndex]);
});

// ====== ROUTES POUR LES TICKETS ======
// Liste de tous les tickets
app.get('/tickets', (req, res) => {
  res.set('Content-Range', `tickets 0-${tickets.length-1}/${tickets.length}`);
  res.set('X-Total-Count', tickets.length);
  res.json(tickets);
});

// Tickets par événement
app.get('/events/:id/tickets', (req, res) => {
  const eventId = parseInt(req.params.id);
  const eventTickets = tickets.filter(t => t.event_id === eventId);
  res.json(eventTickets);
});

// Détail d'un ticket
app.get('/tickets/:id', (req, res) => {
  const ticket = tickets.find(t => t.id === parseInt(req.params.id));
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket non trouvé' });
  }
  res.json(ticket);
});

// Créer un ticket
app.post('/tickets', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  // Si l'utilisateur est un organisateur, vérifier qu'il est bien l'organisateur de l'événement
  const eventId = parseInt(req.body.event_id);
  const event = events.find(e => e.id === eventId);
  
  if (!event) {
    return res.status(404).json({ message: 'Événement non trouvé' });
  }
  
  if (req.user.role === 'organizer' && event.organizer_id !== req.user.id) {
    return res.status(403).json({ message: 'Vous ne pouvez créer des tickets que pour vos propres événements' });
  }
  
  const newTicket = {
    id: tickets.length + 1,
    ...req.body,
    is_active: req.body.is_active !== undefined ? req.body.is_active : true
  };
  
  tickets.push(newTicket);
  res.status(201).json(newTicket);
});

// Modifier un ticket
app.put('/tickets/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  const ticketId = parseInt(req.params.id);
  const ticketIndex = tickets.findIndex(t => t.id === ticketId);
  
  if (ticketIndex === -1) {
    return res.status(404).json({ message: 'Ticket non trouvé' });
  }
  
  // Vérifier si l'utilisateur est l'organisateur de l'événement associé au ticket
  const eventId = tickets[ticketIndex].event_id;
  const event = events.find(e => e.id === eventId);
  
  if (req.user.role === 'organizer' && event.organizer_id !== req.user.id) {
    return res.status(403).json({ message: 'Vous ne pouvez modifier que les tickets de vos propres événements' });
  }
  
  tickets[ticketIndex] = {
    ...tickets[ticketIndex],
    ...req.body,
    id: ticketId, // Conserver l'ID original
    event_id: eventId // Ne pas permettre de changer l'événement associé
  };
  
  res.json(tickets[ticketIndex]);
});

// Supprimer un ticket
app.delete('/tickets/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  const ticketId = parseInt(req.params.id);
  const ticketIndex = tickets.findIndex(t => t.id === ticketId);
  
  if (ticketIndex === -1) {
    return res.status(404).json({ message: 'Ticket non trouvé' });
  }
  
  // Vérifier si l'utilisateur est l'organisateur de l'événement associé au ticket
  const eventId = tickets[ticketIndex].event_id;
  const event = events.find(e => e.id === eventId);
  
  if (req.user.role === 'organizer' && event.organizer_id !== req.user.id) {
    return res.status(403).json({ message: 'Vous ne pouvez supprimer que les tickets de vos propres événements' });
  }
  
  tickets.splice(ticketIndex, 1);
  res.status(204).send();
});

// ====== ROUTES POUR LES UTILISATEURS ======
// Liste de tous les utilisateurs
app.get('/users', authenticateToken, (req, res) => {
  console.log('Requête GET /users par:', req.user);
  
  if (req.user.role !== 'admin') {
    console.log('Accès refusé: rôle insuffisant:', req.user.role);
    return res.status(403).json({ message: 'Non autorisé. Rôle d\'administrateur requis.' });
  }
  
  // Ne pas envoyer les mots de passe
  const safeUsers = users.map(({ password, ...user }) => user);
  res.set('Content-Range', `users 0-${safeUsers.length-1}/${safeUsers.length}`);
  res.set('X-Total-Count', safeUsers.length);
  res.json(safeUsers);
});

// Détail d'un utilisateur
app.get('/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  
  // Ne pas envoyer le mot de passe
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// Modifier un utilisateur
app.put('/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Seul un admin peut modifier le rôle d'un utilisateur
  if (req.body.role && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Non autorisé à modifier le rôle' });
  }
  
  // Les utilisateurs ne peuvent modifier que leur propre profil, sauf les admins
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  
  // Mettre à jour l'utilisateur mais conserver son mot de passe
  const updatedUser = {
    ...users[userIndex],
    ...req.body,
    id: userId, // Conserver l'ID original
    password: users[userIndex].password // Ne pas permettre de modifier le mot de passe via cette route
  };
  
  users[userIndex] = updatedUser;
  
  // Ne pas renvoyer le mot de passe
  const { password, ...safeUser } = updatedUser;
  res.json(safeUser);
});

// ====== ROUTES POUR LES RÉSERVATIONS ======
// Liste de toutes les réservations
app.get('/reservations', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  // Pour chaque réservation, ajouter des détails sur l'événement et le ticket
  const detailedReservations = reservations.map(reservation => {
    const ticket = tickets.find(t => t.id === reservation.ticket_id);
    const event = ticket ? events.find(e => e.id === ticket.event_id) : null;
    
    return {
      ...reservation,
      ticket_details: ticket,
      event_details: event
    };
  });
  
  res.set('Content-Range', `reservations 0-${detailedReservations.length-1}/${detailedReservations.length}`);
  res.set('X-Total-Count', detailedReservations.length);
  res.json(detailedReservations);
});

// Réservations par événement
app.get('/events/:id/reservations', authenticateToken, (req, res) => {
  const eventId = parseInt(req.params.id);
  const event = events.find(e => e.id === eventId);
  
  if (!event) {
    return res.status(404).json({ message: 'Événement non trouvé' });
  }
  
  // Vérifier les autorisations
  if (req.user.role !== 'admin' && 
      (req.user.role !== 'organizer' || event.organizer_id !== req.user.id)) {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  // Trouver les tickets de cet événement
  const eventTicketIds = tickets
    .filter(t => t.event_id === eventId)
    .map(t => t.id);
  
  // Trouver les réservations pour ces tickets
  const eventReservations = reservations
    .filter(r => eventTicketIds.includes(r.ticket_id))
    .map(reservation => {
      const ticket = tickets.find(t => t.id === reservation.ticket_id);
      const user = users.find(u => u.id === reservation.user_id);
      
      return {
        ...reservation,
        ticket_details: ticket,
        user_details: user ? { id: user.id, username: user.username, email: user.email } : null
      };
    });
  
  res.json(eventReservations);
});

// Réservations d'un utilisateur
app.get('/users/:id/reservations', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Les utilisateurs ne peuvent voir que leurs propres réservations, sauf les admins
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  const userReservations = reservations
    .filter(r => r.user_id === userId)
    .map(reservation => {
      const ticket = tickets.find(t => t.id === reservation.ticket_id);
      const event = ticket ? events.find(e => e.id === ticket.event_id) : null;
      
      return {
        ...reservation,
        ticket_details: ticket,
        event_details: event
      };
    });
  
  res.json(userReservations);
});

// Annuler une réservation
app.put('/reservations/:id/cancel', authenticateToken, (req, res) => {
  const reservationId = parseInt(req.params.id);
  const reservationIndex = reservations.findIndex(r => r.id === reservationId);
  
  if (reservationIndex === -1) {
    return res.status(404).json({ message: 'Réservation non trouvée' });
  }
  
  const reservation = reservations[reservationIndex];
  
  // Vérifier les autorisations
  if (req.user.role !== 'admin' && req.user.id !== reservation.user_id) {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  // Mettre à jour le statut de la réservation
  reservations[reservationIndex] = {
    ...reservation,
    status: 'canceled'
  };
  
  // Augmenter la quantité disponible du ticket
  const ticketIndex = tickets.findIndex(t => t.id === reservation.ticket_id);
  if (ticketIndex !== -1) {
    tickets[ticketIndex].available_quantity += reservation.quantity;
  }
  
  res.json(reservations[reservationIndex]);
});

// Route pour l'upload d'image d'un événement
app.post('/events/:id/image', authenticateToken, upload.single('image'), (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
    return res.status(403).json({ message: 'Non autorisé' });
  }
  
  const eventId = parseInt(req.params.id);
  const eventIndex = events.findIndex(e => e.id === eventId);
  
  if (eventIndex === -1) {
    return res.status(404).json({ message: 'Événement non trouvé' });
  }
  
  // Si l'utilisateur est un organisateur, vérifier que c'est son événement
  if (req.user.role === 'organizer' && events[eventIndex].organizer_id !== req.user.id) {
    return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres événements' });
  }
  
  // Si un fichier a été uploadé
  if (req.file) {
    // Mettre à jour l'URL de l'image dans l'événement
    const imageUrl = `/images/${req.file.filename}`;
    events[eventIndex].image_url = imageUrl;
    res.json({ imageUrl });
  } else {
    res.status(400).json({ message: 'Aucune image fournie' });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
