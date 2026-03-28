const db = require('./db');

class Category {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const [result] = await db.query(
            'INSERT INTO categories (name, image_url) VALUES (?, ?)',
            [data.name, data.image_url]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { name, image_url } = data;
        if (image_url) {
            await db.query('UPDATE categories SET name = ?, image_url = ? WHERE id = ?', [name, image_url, id]);
        } else {
            await db.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
        }
    }

    static async delete(id) {
        await db.query('DELETE FROM categories WHERE id = ?', [id]);
    }
}

module.exports = Category;
