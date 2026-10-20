// src/models/Usuario.js
const mongoose = require('mongoose');

// Creamos el modelo del usuario
const usuarioSchema = new mongoose.Schema({
    usuario: {
        type: String,
        required: [true, 'El nombre de usuario es obligatorio'],
        trim: true,
        maxlength: 100
    },
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        maxlength: 100
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es obligatorio'],
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'El correo electrónico es obligatorio'],
        unique: true, 
        lowercase: true,
        trim: true,
        maxlength: 100
    },
    contraseña: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        maxlength: 255
    },
    rol: {
        type: String,
        default: 'cliente',
        enum: ['admin', 'mesero', 'cliente'] 
    },
    estado: {
        type: Boolean, //Por defecto es activo
        default: true
    }
}, {
    timestamps: true // 
});

module.exports = mongoose.model('Usuario', usuarioSchema);