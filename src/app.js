// src/app.js
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const cron = require('node-cron');

// Importaciones de MongoDB (Mongoose) y Configuración
const Usuario = require('./models/Usuario');
const Reserva = require('./models/Reserva');
const conectarBD = require('./config/db');
const backup = require('./servicios/backup');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a la base de datos MongoDB
conectarBD();

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

// --- TAREA PROGRAMADA (PRUEBA CADA MINUTO) ---
// Cambia '* * * * *' a '0 0 * * *' cuando quieras que se ejecute solo a la medianoche
cron.schedule('* * * * *', async () => {
    console.log('🔄 Ejecutando prueba de copia de seguridad...');
    await backup.backupDatabase();
});

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
        const reservas = await Reserva.find({ usuarioId: req.session.usuarioId });
        res.render('dashboard', { reservas, email: req.session.email });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error cargando el panel");
    }
});

// 5. Crear Reserva (Protegido)
app.post('/reservas/crear', verificarAuth, async (req, res) => {
    try {
        const { fecha, hora, cantidad_personas, mesa } = req.body;
        
        await Reserva.create({
            cliente: req.session.email,
            plato: `Mesa ${mesa} ${cantidad_personas} Pers. (${fecha} ${hora})`,
            mesa,
            usuarioId: req.session.usuarioId
        });
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al crear reserva");
    }
});

// 6. Cerrar Sesión
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Arrancar Servidor Express
app.listen(PORT, () => {
    console.log(`🚀 ReserVa Pro corriendo en http://localhost:${PORT}`);
});