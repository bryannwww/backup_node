// Ojo aquí: asegúrate de que el archivo del modelo se llame exactamente 'Usuario.js'
const Usuario = require('../models/Usuario');

// 1. Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.status(200).json({
            ok: true,
            data: usuarios
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener usuarios',
            error: error.message
        });
    }
};

// 2. Crear un nuevo usuario (sencillito y directo)
exports.crearUsuario = async (req, res) => {
    try {
        // Creamos el usuario directo con lo que viene del body
        const nuevoUsuario = new Usuario(req.body);
        const usuarioGuardado = await nuevoUsuario.save();

        res.status(201).json({
            ok: true,
            mensaje: 'Usuario creado exitosamente',
            data: usuarioGuardado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: 'Error al crear el usuario',
            error: error.message
        });
    }
};

//FALTA DELETE Y UPDATEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE