// src/config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const conectarBD = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🟢 Conexión a MongoDB establecida correctamente');
    } catch (error) {
        console.error('🔴 Error al conectar a MongoDB:', error.message);
    }
};

module.exports = conectarBD;