// Importamos el modelo de Reserva (asegúrate de que el archivo se llame Reserva.js)
const Reserva = require('../models/Reserva');

// 1. Obtener todas las reservas
exports.obtenerReservas = async (req, res) => {
    try {
        const reservas = await Reserva.find();
        res.status(200).json({
            ok: true,
            data: reservas
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener las reservas',
            error: error.message
        });
    }
};

// 2. Obtener una sola reserva por ID
exports.obtenerReservaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const reserva = await Reserva.findById(id);

        if (!reserva) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Reserva no encontrada'
            });
        }

        res.status(200).json({
            ok: true,
            data: reserva
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar la reserva',
            error: error.message
        });
    }
};

// 3. Crear una nueva reserva
exports.crearReserva = async (req, res) => {
    try {
        const nuevaReserva = new Reserva(req.body);
        const reservaGuardada = await nuevaReserva.save();

        res.status(201).json({
            ok: true,
            mensaje: 'Reserva creada con éxito',
            data: reservaGuardada
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: 'Error al crear la reserva',
            error: error.message
        });
    }
};

// 4. Actualizar una reserva
exports.actualizarReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const reservaActualizada = await Reserva.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!reservaActualizada) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Reserva no encontrada para actualizar'
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Reserva actualizada correctamente',
            data: reservaActualizada
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar la reserva',
            error: error.message
        });
    }
};

// 5. Eliminar una reserva
exports.eliminarReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const reservaEliminada = await Reserva.findByIdAndDelete(id);

        if (!reservaEliminada) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Reserva no encontrada para eliminar'
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Reserva eliminada con éxito'
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al eliminar la reserva',
            error: error.message
        });
    }
};