const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');
const Usuario = require('../models/Usuario');
const Reserva = require('../models/Reserva');

require('dotenv').config({ path: path.join(process.cwd(), '.env') });

// Función auxiliar para crear el ZIP nativo en Linux
const comprimirEnZip = (folderPath, zipPath) => {
    return new Promise((resolve, reject) => {
        const folderName = path.basename(folderPath);
        const parentDir = path.dirname(folderPath);

        exec(`cd "${parentDir}" && zip -r "${zipPath}" "${folderName}"`, (error) => {
            if (error) {
                return reject(error);
            }
            resolve();
        });
    });
};

exports.backupDatabase = async () => {
    console.log('🏁 Iniciando proceso de respaldo en formato ZIP...');
    try {
        const backupFolder = path.join(process.cwd(), 'backup');

        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder, { recursive: true });
        }

        // 1. Consultar base de datos
        console.log('🔍 Consultando colecciones en MongoDB...');
        const usuarios = await Usuario.find({}).lean();
        const reservas = await Reserva.find({}).lean();

        // --- FORMATO DE FECHA Y HORA LEGIBLE ---
        const ahora = new Date();
        const fecha = ahora.toISOString().split('T')[0]; // Ejemplo: 2026-10-20
        const hora = ahora.toTimeString().split(' ')[0].replace(/:/g, '-'); // Ejemplo: 15-24-00

        // Nombre personalizado: ReserVa_YYYY-MM-DD_HH-mm-ss
        const folderName = `ReserVa_${fecha}_${hora}`;
        const targetPath = path.join(backupFolder, folderName);

        fs.mkdirSync(targetPath, { recursive: true });

        const usuariosPath = path.join(targetPath, 'usuarios.json');
        const reservasPath = path.join(targetPath, 'reservas.json');

        // 2. Guardar archivos de datos locales
        fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
        fs.writeFileSync(reservasPath, JSON.stringify(reservas, null, 2));

        // 3. Crear el archivo ZIP comprimido
        const zipPath = path.join(backupFolder, `${folderName}.zip`);
        await comprimirEnZip(targetPath, zipPath);

        console.log(`✅ Archivo ZIP generado con éxito en /backup/${folderName}.zip`);

        // 4. Obtener credenciales del .env
        const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
        const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

        if (!emailUser || !emailPass) {
            console.warn('⚠️ Cancelando envío: EMAIL_USER o EMAIL_PASS no definidos en el .env');
            return;
        }

        // 5. Configurar Nodemailer
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        const destinatario = process.env.EMAIL_TO || emailUser;

        const mailOptions = {
            from: `"ReserVa Pro Backup" <${emailUser}>`,
            to: destinatario,
            subject: `📦 Respaldo Comprimido - ${folderName}`,
            html: `
                <h3>📦 Copia de Seguridad Generada Con Éxito</h3>
                <p><b>Archivo:</b> <code>${folderName}.zip</code></p>
                <p><b>Fecha:</b> ${fecha}</p>
                <p><b>Hora:</b> ${ahora.toLocaleTimeString()}</p>
                <p><b>Total Usuarios:</b> ${usuarios.length}</p>
                <p><b>Total Reservas:</b> ${reservas.length}</p>
                <hr>
                <p>Adjunto encontrarás el archivo de respaldo <code>${folderName}.zip</code>.</p>
            `,
            attachments: [
                { filename: `${folderName}.zip`, path: zipPath }
            ]
        };

        console.log(`⏳ Enviando archivo ZIP por Nodemailer a ${destinatario}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Copia de seguridad (${folderName}.zip) enviada con éxito (ID: ${info.messageId})`);

    } catch (error) {
        console.error('❌ Error capturado en backup.js:', error.message);
    }
};