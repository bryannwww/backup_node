const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
    cliente: {
        type: String,
        required: true
    },
    plato: {
        type: String,
        required: true
    },
    mesa: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        default: 'Pendiente'
    },
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Reserva', reservaSchema);