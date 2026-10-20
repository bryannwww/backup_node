// Importamos el modelo de Gasto
const Gasto = require('../models/Gasto');

// 1. Obtener todos los gastos / ingresos
exports.obtenerGastos = async (req, res) => {
    try {
        // Usamos populate por si queremos ver los datos del usuario que registró el movimiento
        const gastos = await Gasto.find().populate('registrado_por', 'nombre apellido');
        
        res.status(200).json({
            ok: true,
            data: gastos
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener los registros financieros',
            error: error.message
        });
    }
};

// 2. Obtener un registro financiero por su ID
exports.obtenerGastoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const gasto = await Gasto.findById(id).populate('registrado_por', 'nombre apellido');

        if (!gasto) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Registro financiero no encontrado'
            });
        }

        res.status(200).json({
            ok: true,
            data: gasto
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar el registro financiero',
            error: error.message
        });
    }
};

// 3. Crear un nuevo gasto o ingreso
exports.crearGasto = async (req, res) => {
    try {
        const nuevoGasto = new Gasto(req.body);
        const gastoGuardado = await nuevoGasto.save();

        res.status(201).json({
            ok: true,
            mensaje: 'Registro financiero creado exitosamente',
            data: gastoGuardado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: 'Error al crear el registro. Revisa los datos (tipo, categoría, valor o método de pago).',
            error: error.message
        });
    }
};

// 4. Actualizar un registro financiero
exports.actualizarGasto = async (req, res) => {
    try {
        const { id } = req.params;
        const gastoActualizado = await Gasto.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!gastoActualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Registro financiero no encontrado para actualizar'
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Registro financiero actualizado correctamente',
            data: gastoActualizado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: 'Error al actualizar el registro financiero',
            error: error.message
        });
    }
};

// 5. Eliminar un registro financiero
exports.eliminarGasto = async (req, res) => {
    try {
        const { id } = req.params;
        const gastoEliminado = await Gasto.findByIdAndDelete(id);

        if (!gastoEliminado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Registro financiero no encontrado para eliminar'
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Registro financiero eliminado con éxito'
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al eliminar el registro financiero',
            error: error.message
        });
    }
};