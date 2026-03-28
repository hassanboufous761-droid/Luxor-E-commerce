const db = require('./db');

class Product {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { name, price, description, image_url, stock_quantity, category } = data;
        const [result] = await db.query(
            'INSERT INTO products (name, price, description, image_url, stock_quantity, category) VALUES (?, ?, ?, ?, ?, ?)',
            [name, price, description, image_url, stock_quantity, category]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { name, price, description, image_url, stock_quantity, category } = data;
        await db.query(
            'UPDATE products SET name = ?, price = ?, description = ?, image_url = ?, stock_quantity = ?, category = ? WHERE id = ?',
            [name, price, description, image_url, stock_quantity, category, id]
        );
    }

    static async delete(id) {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
    }
}

module.exports = Product;
