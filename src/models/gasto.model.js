// src/models/Gasto.js
const mongoose = require('mongoose');

const gastoSchema = new mongoose.Schema({
    tipo: {
        type: String,
        required: true,
        default: 'GASTO',
        enum: ['INGRESO', 'GASTO'] // Esto es el CHOISES de Django
    },
    concepto: {
        type: String,
        required: [true, 'El concepto es obligatorio'],
        trim: true,
        maxlength: 200
    },
    categoria: {
        type: String,
        required: true,
        default: 'OTROS',
        enum: ['RESERVA', 'INSUMOS', 'SERVICIOS', 'NOMINA', 'OTROS'] // Equivale a CATEGORIA_CHOICES
    },
    valor: {
        type: Number,
        required: [true, 'El valor es obligatorio'],
        min: [0, 'El valor no puede ser negativo']
    },
    fecha: {
        type: Date,
        default: Date.now // Guarda fecha y hora actual automáticamente
    },
    metodo_pago: {
        type: String,
        required: [true, 'El método de pago es obligatorio'],
        enum: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'] // Equivale a METODO_PAGO_CHOICES
    },
    registrado_por: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario' // Relación opcional por si quieres saber qué usuario registró el movimiento
    }
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Gasto', gastoSchema);