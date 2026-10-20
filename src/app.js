// src/app.js
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const cron = require('node-cron');
const mongoose = require('mongoose');

// Importaciones de MongoDB (Mongoose) y Configuración
const Usuario = require('./models/Usuario');
const Reserva = require('./models/Reserva');
const conectarBD = require('./config/db');
const backup = require('./servicios/backup');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de vistas EJS
app.set('view engine', 'ejs');
app.set('views', './src/views');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'reserva_secret_key_pro',
    resave: false,
    saveUninitialized: false
}));

// Middleware para proteger rutas privadas
const verificarAuth = (req, res, next) => {
    if (!req.session.usuarioId) {
        return res.redirect('/login');
    }
    next();
};

// Archivos estáticos
app.use(express.static('public'));

// --- RUTAS DE LA APLICACIÓN ---

// 1. Landing page
app.get('/', (req, res) => {
    res.render('landing_usuario', { 
        usuarioId: req.session.usuarioId || null 
    });
});

// 2. Vista Login
app.get('/login', (req, res) => {
    if (req.session.usuarioId) return res.redirect('/dashboard');
    res.render('login', { error: null });
});

// Procesar Login (Mongoose syntax)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await Usuario.findOne({ email });
        
        if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
            return res.render('login', { error: "Correo o contraseña incorrectos" });
        }

        req.session.usuarioId = usuario._id;
        req.session.email = usuario.email;

        // Si el usuario intentó hacer una reserva desde el inicio antes de loguearse:
        if (req.session.reservaPendiente) {
            const pendiente = req.session.reservaPendiente;
            delete req.session.reservaPendiente;

            const mesaFinal = pendiente.mesa ? String(pendiente.mesa).trim() : '1';
            const personas = pendiente.cantidad_personas ? Number(pendiente.cantidad_personas) : 1;
            const fechaHora = pendiente.fecha ? `(${pendiente.fecha}${pendiente.hora ? ' ' + pendiente.hora : ''})` : '';
            const platoFinal = (pendiente.plato && pendiente.plato.trim() !== '') 
                ? pendiente.plato.trim() 
                : `Reserva para ${personas} Pers. ${fechaHora}`.trim();

            await Reserva.create({
                cliente: (pendiente.cliente && pendiente.cliente.trim() !== '') ? pendiente.cliente.trim() : usuario.email,
                plato: platoFinal,
                mesa: mesaFinal,
                fecha: pendiente.fecha || new Date().toISOString().split('T')[0],
                hora: pendiente.hora || '19:00',
                cantidad_personas: personas,
                estado: 'Confirmada',
                usuarioId: usuario._id
            });
            console.log(`✅ Reserva pendiente creada tras iniciar sesión para: ${usuario.email}`);
        }

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('login', { error: "Error en el servidor" });
    }
});

// 3. Vista Registro
app.get('/register', (req, res) => {
    if (req.session.usuarioId) return res.redirect('/dashboard');
    res.render('register', { error: null });
});

// Procesar Registro (Mongoose syntax)
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existe = await Usuario.findOne({ email });
        
        if (existe) {
            return res.render('register', { error: "El correo ya está registrado" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await Usuario.create({ email, password: hashedPassword });

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.render('register', { error: "Error al registrar la cuenta" });
    }
});

// 4. Dashboard (Protegido)
app.get('/dashboard', verificarAuth, async (req, res) => {
    try {
        const reservas = await Reserva.find({ usuarioId: req.session.usuarioId }).sort({ createdAt: -1 });
        res.render('dashboard', { reservas, email: req.session.email });
    } catch (error) {
        console.error('Error al cargar panel:', error);
        res.status(500).send("Error cargando el panel");
    }
});

// 5. Crear Reserva
app.post('/reservas/crear', async (req, res) => {
    try {
        // Si no ha iniciado sesión, guardamos los datos para crearlos luego de que inicie sesión
        if (!req.session.usuarioId) {
            req.session.reservaPendiente = req.body;
            return res.redirect('/login');
        }

        const { cliente, plato, mesa, fecha, hora, cantidad_personas } = req.body;

        const clienteFinal = (cliente && cliente.trim() !== '') ? cliente.trim() : req.session.email;
        const mesaFinal = (mesa && String(mesa).trim() !== '') ? String(mesa).trim() : '1';
        const personas = cantidad_personas ? Number(cantidad_personas) : 1;

        let platoFinal = (plato && plato.trim() !== '') ? plato.trim() : null;
        if (!platoFinal) {
            const fechaHora = fecha ? `(${fecha}${hora ? ' ' + hora : ''})` : '';
            platoFinal = `Reserva para ${personas} Pers. ${fechaHora}`.trim();
        }

        const nuevaReserva = await Reserva.create({
            cliente: clienteFinal,
            plato: platoFinal,
            mesa: mesaFinal,
            fecha: fecha || new Date().toISOString().split('T')[0],
            hora: hora || '19:00',
            cantidad_personas: personas,
            estado: 'Confirmada',
            usuarioId: req.session.usuarioId
        });

        console.log(`✅ Reserva guardada con éxito: ${clienteFinal} - Mesa: ${mesaFinal} (${nuevaReserva._id})`);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('❌ Error al crear reserva:', error);
        res.status(500).send(`Error al crear reserva: ${error.message}`);
    }
});

// 6. Cerrar Sesión
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// --- INICIALIZACIÓN DEL SERVIDOR Y TAREAS PROGRAMADAS ---
async function iniciarServidor() {
    try {
        // 1. Primero conectar a la base de datos de manera explícita
        await conectarBD();

        // 2. Tarea programada (Cada minuto)
        cron.schedule('*/5 * * * *', async () => {
            console.log('🔄 Ejecutando tarea programada de copia de seguridad...');
            await backup.backupDatabase();
        });

        // 3. Levantar el servidor Express
        app.listen(PORT, async () => {
            console.log(`🚀 ReserVa Pro corriendo en http://localhost:${PORT}`);
            // Ejecutar una prueba inmediata AHORA QUE SÍ HAY CONEXIÓN A MONGODB
            console.log('🧪 Ejecutando prueba de respaldo inicial...');
            await backup.backupDatabase();
        });

    } catch (error) {
        console.error('❌ Error crítico al iniciar la aplicación:', error.message);
    }
}

iniciarServidor();