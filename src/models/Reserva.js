const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
    cliente: {
        type: String,
        required: true,
        trim: true
    },
    plato: {
        type: String,
        required: true,
        default: 'General',
        trim: true
    },
    mesa: {
        type: String, // Permite tanto números ("1", "2") como áreas ("Interior", "Terraza", "VIP")
        required: true,
        trim: true
    },
    fecha: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    },
    hora: {
        type: String,
        default: '19:00'
    },
    cantidad_personas: {
        type: Number,
        default: 1
    },
    estado: {
        type: String,
        default: 'Confirmada'
    },
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Reserva', reservaSchema);
