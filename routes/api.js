const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const Contact = require('../models/Contact');
const Category = require('../models/Category');

// Contact submission
router.post('/contacts', async (req, res) => {
    try {
        await Contact.create(req.body);
        res.json({ success: true, message: 'Message envoyé avec succès' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Categories
router.get('/categories', async (req, res) => {
    try {
        const cats = await Category.findAll();
        res.json(cats);
    } catch (error) {
        res.status(500).json(error.message);
    }
});

// Get all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new order
router.post('/orders', async (req, res) => {
    try {
        const { customer, items } = req.body;
        
        // Validation finale du stock
        for (const item of items) {
            const p = await Product.findById(item.id);
            if (!p) {
                return res.status(400).json({ success: false, error: `Le produit #${item.id} n'existe plus.` });
            }
            if (p.stock_quantity < item.quantity) {
                return res.status(400).json({ success: false, error: `Stock insuffisant pour ${p.name} (Disponible: ${p.stock_quantity})` });
            }
        }

        const orderId = await Order.create(customer, items);
        res.status(201).json({ success: true, orderId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
