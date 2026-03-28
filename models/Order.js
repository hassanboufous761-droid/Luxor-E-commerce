const db = require('./db');

class Order {
    static async create(customerData, items) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { name, address, phone, email, total_price } = customerData;
            const [orderResult] = await connection.query(
                'INSERT INTO orders (customer_name, address, phone, email, total_price) VALUES (?, ?, ?, ?, ?)',
                [name, address, phone, email, total_price]
            );
            const orderId = orderResult.insertId;

            for (const item of items) {
                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.id, item.quantity, item.price]
                );
                // Update stock
                await connection.query(
                    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                    [item.quantity, item.id]
                );
                // Auto-delete if stock reaches 0
                const [pRows] = await connection.query('SELECT stock_quantity FROM products WHERE id = ?', [item.id]);
                if (pRows[0] && pRows[0].stock_quantity <= 0) {
                    await connection.query('DELETE FROM products WHERE id = ?', [item.id]);
                }
            }

            await connection.commit();
            return orderId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findAll() {
        const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        
        const [items] = await db.query(`
            SELECT oi.*, p.name as product_name 
            FROM order_items oi 
            JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = ?
        `, [id]);
        
        return { ...rows[0], items };
    }

    static async delete(id) {
        await db.query('DELETE FROM orders WHERE id = ?', [id]);
    }

    static async updateStatus(id, status) {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    }
}

module.exports = Order;
