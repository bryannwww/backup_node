const mongoose = require('mongoose');

// Definición del esquema para el modelo Plato
const platoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    maxlength: 100
  },
  descripcion: {
    type: String,
    maxlength: 400,
    default: ''
  },
  precio: {
    type: Number,
    required: true
  },
  disponible: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

platoSchema.methods.obtenerResumen = function() {
  return this.nombre;
};

module.exports = mongoose.model('Plato', platoSchema);