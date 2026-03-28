const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'sunglasses_shop',
        port: process.env.DB_PORT || 3306,
        multipleStatements: true,
        ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: false
        } : null
    };

    const connection = await mysql.createConnection(config);

    try {
        console.log('Connexion à MySQL réussie...');

        // 1. Fix Foreign Key on existing table if it exists
        try {
            console.log('Mise à jour des contraintes de clés étrangères...');
            const [rows] = await connection.query("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'order_items' AND COLUMN_NAME = 'product_id' AND CONSTRAINT_NAME = 'order_items_ibfk_2'");
            if (rows.length > 0) {
                await connection.query('ALTER TABLE order_items DROP FOREIGN KEY order_items_ibfk_2');
            }
            await connection.query('ALTER TABLE order_items ADD CONSTRAINT order_items_ibfk_2 FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE');
        } catch (e) {
            console.log('Note: La contrainte sera créée via le schéma complet.');
        }

        // 2. Read and run full schema
        const schemaSql = fs.readFileSync(path.join(__dirname, 'db_schema.sql'), 'utf8');
        await connection.query(schemaSql);

        console.log('✅ Base de données configurée avec succès !');
    } catch (error) {
        console.error('❌ Erreur :', error.message);
    } finally {
        await connection.end();
    }
}

setupDatabase();
