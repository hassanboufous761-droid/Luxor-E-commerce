const express = require('express');
const router = express.Router();
router.use((req, res, next) => {
    console.log(`[ADMIN ROUTE] ${req.method} ${req.url}`);
    next();
});
const Product = require('../models/Product');
const Order = require('../models/Order');
const Contact = require('../models/Contact');
const Category = require('../models/Category');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage setup
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'luxor-ecommerce',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});
const upload = multer({ storage });

// Admin Authentication Middleware
function isAdmin(req, res, next) {
    if (req.session.isAdmin) return next();
    res.redirect('/admin/login');
}

// Login Routes
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
        req.session.isAdmin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.render('login', { error: 'Identifiants invalides' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        const products = await Product.findAll();
        const orders = await Order.findAll();
        const messages = await Contact.findAll(); // ADD THIS
        
        const ordersPending = orders.filter(function(o) { return o.status === 'En attente'; }).length;
        const lowStockCount = products.filter(function(p) { return p.stock_quantity < 5; }).length;
        
        res.render('dashboard', { products, orders, ordersPending, lowStockCount, messages });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Products Management
router.get('/products', isAdmin, async (req, res) => {
    const products = await Product.findAll();
    const categories = await Category.findAll();
    res.render('products', { products, categories });
});

router.post('/products/add', isAdmin, upload.single('image'), async (req, res) => {
    const { name, price, description, stock_quantity, category } = req.body;
    const image_url = req.file ? req.file.path : '';
    await Product.create({ name, price, description, image_url, stock_quantity, category });
    res.redirect('/admin/products');
});

router.post('/products/delete/:id', isAdmin, async (req, res) => {
    await Product.delete(req.params.id);
    res.redirect('/admin/products');
});

router.post('/products/update/:id', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, stock_quantity, category } = req.body;
        const oldProduct = await Product.findById(req.params.id);
        const image_url = req.file ? req.file.path : (oldProduct ? oldProduct.image_url : '');
        await Product.update(req.params.id, { name, price, description, image_url, stock_quantity, category });
        res.redirect('/admin/products');
    } catch (err) {
        console.error('Update Product Error:', err);
        res.status(500).send('Erreur lors de la mise à jour: ' + err.message);
    }
});

// Orders Management
router.get('/orders', isAdmin, async (req, res) => {
    const orders = await Order.findAll();
    res.render('orders', { orders });
});

router.post('/orders/confirm/:id', isAdmin, async (req, res) => {
    await Order.updateStatus(req.params.id, 'Confirmée');
    res.redirect('/admin/orders');
});

router.post('/orders/delete/:id', isAdmin, async (req, res) => {
    await Order.delete(req.params.id);
    res.redirect('/admin/orders');
});

// Categories Management
router.get('/categories', isAdmin, async (req, res) => {
    const cats = await Category.findAll();
    res.render('categories', { categories: cats });
});

router.post('/categories/add', isAdmin, upload.single('image'), async (req, res) => {
    const { name } = req.body;
    const image_url = req.file ? req.file.path : '';
    await Category.create({ name, image_url });
    res.redirect('/admin/categories');
});

router.post('/categories/delete/:id', isAdmin, async (req, res) => {
    await Category.delete(req.params.id);
    res.redirect('/admin/categories');
});

router.post('/categories/update/:id', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name } = req.body;
        const oldCat = await Category.findById(req.params.id);
        const image_url = req.file ? req.file.path : (oldCat ? oldCat.image_url : '');
        await Category.update(req.params.id, { name, image_url });
        res.redirect('/admin/categories');
    } catch (err) {
        console.error('Update Category Error:', err);
        res.status(500).send('Erreur lors de la mise à jour: ' + err.message);
    }
});

// Messages Management
router.get('/messages', isAdmin, async (req, res) => {
    const msgs = await Contact.findAll();
    res.render('messages', { messages: msgs });
});

router.post('/messages/delete/:id', isAdmin, async (req, res) => {
    await Contact.delete(req.params.id);
    res.redirect('/admin/messages');
});

module.exports = router;
