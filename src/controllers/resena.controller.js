// Importamos el modelo de Reseña
const Resena = require('../models/Resena');

// 1. Obtener todas las reseñas
exports.obtenerResenas = async (req, res) => {
    try {
        // Opcional: .populate('usuario') te trae los datos completos del usuario en lugar de solo su ID
        const resenas = await Resena.find().populate('usuario', 'nombre apellido');
        
        res.status(200).json({
            ok: true,
            data: resenas
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener las reseñas',
            error: error.message
        });
    }
};

// 2. Obtener una sola reseña por ID
exports.obtenerResenaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const resena = await Resena.findById(id).populate('usuario', 'nombre apellido');

        if (!resena) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Reseña no encontrada'
            });
        }

        res.status(200).json({
            ok: true,
            data: resena
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar la reseña',
            error: error.message
        });
    }
};

// 3. Crear una nueva reseña
exports.crearResena = async (req, res) => {
    try {
        const nuevaResena = new Resena(req.body);
        const resenaGuardada = await nuevaResena.save();

        res.status(201).json({
            ok: true,
            mensaje: 'Reseña creada exitosamente',
            data: resenaGuardada
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: 'Error al crear la reseña. Revisa las calificaciones (deben ser entre 1 y 5).',
            error: error.message
        });
    }
};

// 4. Actualizar una reseña
exports.actualizarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const resenaActualizada = await Resena.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!resenaActualizada) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Reseña no encontrada para actualizar'
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Reseña actualizada correctamente',
            data: resenaActualizada
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar la reseña',
            error: error.message
        });
    }
};

// 5. Eliminar una reseña
exports.eliminarResena = async (req, res) => {
    try {
        const { id } = req.params;
        const resenaEliminada = await Resena.findByIdAndDelete(id);

        if (!resenaEliminada) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Reseña no encontrada para eliminar'
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Reseña eliminada con éxito'
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al eliminar la reseña',
            error: error.message
        });
    }
};