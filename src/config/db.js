// src/config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const conectarBD = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Falla rápido (5s) si la red bloquea la conexión
        });
        console.log('🟢 Conexión a MongoDB establecida correctamente');
    } catch (error) {
        console.error('🔴 Error al conectar a MongoDB:', error.message);
        throw error; // <-- CRUCIAL: Detiene la ejecución si no hay internet/conexión
    }
};

module.exports = conectarBD;