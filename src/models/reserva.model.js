const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    maxlength: 100
  },
  fecha: {
    type: Date,
    required: true
  },
  hora: {
    type: String,
    required: true
  },
  cantidad_personas: {
    type: Number,
    required: true,
    min: 1
  },
  telefono: {
    type: String,
    required: true,
    maxlength: 20
  },
  mesa: {
    type: String,
    required: true,
    maxlength: 3
  },
  notas: {
    type: String,
    default: ''
  },
  estado: {
    type: String,
    enum: ['pendiente', 'asistio', 'cancelada'],
    default: 'pendiente'
  }
}, { 
  timestamps: true // <--- ¡Aquí también!
});

reservaSchema.methods.obtenerResumen = function() {
  return `${this.nombre} - ${this.fecha.toISOString().split('T')[0]} ${this.hora}`;
};

module.exports = mongoose.model('Reserva', reservaSchema);