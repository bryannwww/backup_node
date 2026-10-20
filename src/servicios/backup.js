/* eslint-disable no-unused-vars */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

exports.backupDatabase = async () => {
    // Ruta donde se guardará la carpeta de backups
    const outputPath = path.join(__dirname, '../../backup');

    // Crear la carpeta backup en la raíz si no existe
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    const command = `.\\mongodump.exe --uri="${process.env.MONGO_URI}" --out="${outputPath}" --gzip`

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error en el respaldo: ${error.message}`);
            return;
        }
        console.log(`✅ Respaldo de MongoDB completado con éxito a las ${new Date().toLocaleTimeString()}`);
    });
};