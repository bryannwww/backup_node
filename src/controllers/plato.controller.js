const Plato = require('../models/Plato');

// 1. Obtener todos los platos del menú
exports.obtenerPlatos = async (req, res) => {
    try {
        const platos = await Plato.find();
        res.status(200).json({
            ok: true,
            data: platos
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener los platos del menú',
            error: error.message
        });
    }
};

// 2. Obtener un plato por su ID
exports.obtenerPlatoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const plato = await Plato.findById(id);

        if (!plato) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Plato no encontrado'
            });
        }

        res.status(200).json({
            ok: true,
            data: plato
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar el plato',
            error: error.message
        });
    }
};

// 3. Crear un nuevo plato
exports.crearPlato = async (req, res) => {
    try {
        const nuevoPlato = new Plato(req.body);
        const platoGuardado = await nuevoPlato.save();

        res.status(201).json({
            ok: true,
            mensaje: 'Plato creado exitosamente',
            data: platoGuardado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: 'Error al crear el plato',
            error: error.message
        });
    }
};

// 4. Actualizar un plato
exports.actualizarPlato = async (req, res) => {
    try {
        const { id } = req.params;
        const platoActualizado = await Plato.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!platoActualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Plato no encontrado para actualizar'
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Plato actualizado correctamente',
            data: platoActualizado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar el plato',
            error: error.message
        });
    }
};

// 5. Eliminar un plato
exports.eliminarPlato = async (req, res) => {
    try {
        const { id } = req.params;
        const platoEliminado = await Plato.findByIdAndDelete(id);

        if (!platoEliminado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Plato no encontrado para eliminar'
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Plato eliminado con éxito'
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al eliminar el plato',
            error: error.message
        });
    }
};