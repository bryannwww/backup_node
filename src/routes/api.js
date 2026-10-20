// src/routes/api.js
const express = require('express');
const router = express.Router();
const { registrar, login, listarReservas, crearReserva } = require('../controllers/authController');

// Rutas de Auth
router.post('/register', registrar);
router.post('/login', login);

// Rutas de Reservas (Listar y Crear)
router.get('/reservas', listarReservas);
router.post('/reservas', crearReserva);

module.exports = router;