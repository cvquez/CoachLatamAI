const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const migrationFile = process.argv[2];

if (!migrationFile) {
    console.error('Proporciona la ruta del archivo de migración como argumento.');
    console.error('Ejemplo: node scripts/run_migration.js supabase/migrations/20260211_handle_coach_profile_creation.sql');
    process.exit(1);
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Error: DATABASE_URL no encontrada en .env.local');
    console.error('Agrega DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DB] a tu archivo .env.local');
    process.exit(1);
}

const client = new Client({
    connectionString,
});

async function runMigration() {
    try {
        await client.connect();
        console.log('Conectado a la base de datos.');

        const sqlPath = path.resolve(process.cwd(), migrationFile);
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`Archivo no encontrado: ${sqlPath}`);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log(`Ejecutando migración: ${migrationFile}...`);

        await client.query(sql);

        console.log('Minigración completada exitosamente.');
    } catch (err) {
        console.error('Error durante la migración:', err);
    } finally {
        await client.end();
    }
}

runMigration();
