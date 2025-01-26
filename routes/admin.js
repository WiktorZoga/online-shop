const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');
const isAdmin = require('../middleware/isAdmin');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        const fileName = path.basename(file.originalname); 
        cb(null, fileName); 
    }
});

const upload = multer({ storage }).array('images', 5);

router.get('/', isAdmin, (req, res) => {
    res.render('admin/panel', {
        username: req.session.account.username,
    });
});

router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.render('admin/users', {
            username: req.session.account.username,
            users,
        });
    } catch (err) {
        console.error('Błąd podczas ładowania użytkowników:', err);
        res.status(500).send('Coś poszło nie tak.');
    }
});

router.post('/users/delete', isAdmin, async (req, res) => {
    const { id } = req.body;

    try {
        await User.findByIdAndDelete(id);
        res.redirect('/admin/users');
    } catch (err) {
        console.error('Błąd podczas usuwania użytkownika:', err);
        res.status(500).send('Coś poszło nie tak.');
    }
});

router.post('/users/assign-admin', isAdmin, async (req, res) => {
    const { id } = req.body;

    try {
        await User.findByIdAndUpdate(id, { type: 'admin' });
        res.redirect('/admin/users');
    } catch (err) {
        console.error('Błąd podczas nadawania uprawnień administratora:', err);
        res.status(500).send('Coś poszło nie tak.');
    }
});

router.get('/products', isAdmin, async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/products', {
            username: req.session.account.username,
            products,
        });
    } catch (err) {
        console.error('Błąd podczas ładowania produktów:', err);
        res.status(500).send('Coś poszło nie tak.');
    }
});

router.get('/products/edit/:id?', isAdmin, async (req, res) => {
    const { id } = req.params;
    let product = null;

    if (id) {
        try {
            product = await Product.findById(id);
        } catch (err) {
            console.error('Błąd podczas ładowania produktu:', err);
            return res.status(500).send('Coś poszło nie tak.');
        }
    }

    res.render('admin/add-edit-product', {
        username: req.session.account.username,
        product,
    });
});

router.post('/products', isAdmin, upload, async (req, res) => {
    const { id, name, price, description } = req.body;

    if (!name || !price || !description) {
        return res.status(400).send('Wszystkie pola są wymagane.');
    }
    const imageUrls = req.files ? req.files.map(file => file.filename) : [];  

    try {
        const productData = { name, price, description, imageUrls };

        if (id) {
            await Product.findByIdAndUpdate(id, productData);
        } else {
            const newProduct = new Product(productData);
            await newProduct.save();
        }

        res.redirect('/admin/products');
    } catch (err) {
        console.error('Błąd podczas zapisywania produktu:', err);
        res.status(500).send('Coś poszło nie tak.');
    }
});

router.post('/products/delete', isAdmin, async (req, res) => {
    const { id } = req.body;

    try {
        await Product.findByIdAndDelete(id);
        res.redirect('/admin/products');
    } catch (err) {
        console.error('Błąd podczas usuwania produktu:', err);
        res.status(500).send('Coś poszło nie tak.');
    }
});

router.get('/orders', isAdmin, async (req, res) => {
    if (req.session.account.type !== 'admin') {
        return res.redirect('/');
    }

    try {
        const orders = await Order.find().populate('userId', 'username').exec();
        res.render('admin/orders', {
            username: req.session.account.username,
            orders,
        });
    } catch (err) {
        console.error('Błąd podczas ładowania zamówień:', err);
        res.status(500).send('Coś poszło nie tak.');
    }
});

router.get('/orders/:id', isAdmin, async (req, res) => {
    if (req.session.account.type !== 'admin') {
        return res.redirect('/');
    }

    const { id } = req.params;
    try {
        const order = await Order.findById(id).populate('userId', 'username').populate('items.productId', 'name price').exec();
        if (!order) {
            return res.status(404).send('Zamówienie nie znalezione.');
        }

        res.render('admin/order-details', {
            username: req.session.account.username,
            order,
        });
    } catch (err) {
        console.error('Błąd podczas ładowania szczegółów zamówienia:', err);
        res.status(500).send('Coś poszło nie tak.');
    }
});

router.post('/orders/:id/status', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
        if (!order) {
            return res.status(404).send('Zamówienie nie znalezione.');
        }

        res.redirect('/admin/orders');
    } catch (err) {
        console.error('Błąd podczas zmiany statusu zamówienia:', err);
        res.status(500).send('Coś poszło nie tak.');
    }
});

module.exports = router;
