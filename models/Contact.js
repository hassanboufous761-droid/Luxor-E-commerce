const db = require('./db');

class Contact {
    static async create(data) {
        const [result] = await db.query(
            'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
            [data.name, data.email, data.message]
        );
        return result.insertId;
    }

    static async findAll() {
        const [rows] = await db.query('SELECT * FROM contacts ORDER BY created_at DESC');
        return rows;
    }

    static async delete(id) {
        await db.query('DELETE FROM contacts WHERE id = ?', [id]);
    }
}

module.exports = Contact;
