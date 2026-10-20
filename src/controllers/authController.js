// src/controllers/authController.js
const bcrypt = require('bcryptjs');

// Simulación de BD en memoria (luego lo pasamos a SQL)
let usuarios = []; // { id, email, password }
let reservas = [
    { id: 1, cliente: "Miguel", plato: "Bandeja Paisa", mesa: 4, estado: "Confirmada" },
    { id: 2, cliente: "Bryan", plato: "Sancocho", mesa: 2, estado: "Pendiente" }
];

// Registrar usuario
const registrar = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existe = usuarios.find(u => u.email === email);
        if (existe) return res.status(400).json({ error: "El usuario ya existe" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const nuevoUsuario = { id: usuarios.length + 1, email, password: hashedPassword };
        usuarios.push(nuevoUsuario);

        res.status(201).json({ mensaje: "Usuario registrado con éxito", email: nuevoUsuario.email });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// Login básico
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = usuarios.find(u => u.email === email);
        if (!usuario) return res.status(400).json({ error: "Credenciales inválidas" });

        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) return res.status(400).json({ error: "Credenciales inválidas" });

        res.json({ mensaje: "Login exitoso", usuario: usuario.email });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// Listar reservas
const listarReservas = (req, res) => {
    res.json(reservas);
};

// Crear reserva
const crearReserva = (req, res) => {
    const nueva = { id: reservas.length + 1, ...req.body };
    reservas.push(nueva);
    res.status(201).json({ mensaje: "Reserva creada", reserva: nueva });
};

module.exports = { registrar, login, listarReservas, crearReserva };