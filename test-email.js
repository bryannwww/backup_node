const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('--- VERIFICANDO CREDENCIALES ---');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '*** (Cargada)' : '❌ NO DETECTADA');

const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass
    }
});

async function probarEnvio() {
    try {
        console.log('⏳ Intentando conectar con Gmail...');
        
        // Verificar conexión con los servidores de Google
        await transporter.verify();
        console.log('🟢 Conexión con los servidores de Gmail: EXITOSA');

        // Enviar correo de prueba
        const info = await transporter.sendMail({
            from: `"Prueba ReserVa" <${emailUser}>`,
            to: emailUser,
            subject: '🧪 Prueba de Nodemailer',
            text: 'Si lees esto, las credenciales del .env funcionan al 100%'
        });

        console.log('📧 Correo enviado con éxito. ID de mensaje:', info.messageId);
    } catch (error) {
        console.error('❌ Error detectado:', error.message);
        if (error.response) {
            console.error('Detalle de Google:', error.response);
        }
    }
}

probarEnvio();