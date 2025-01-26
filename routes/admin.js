const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ścieżka, gdzie będą zapisywane pliki
        cb(null, path.join(__dirname, '../public/uploads'));  // Katalog public/uploads
    },
    filename: (req, file, cb) => {
        // Zmiana nazwy pliku na unikalną (zawiera timestamp i rozszerzenie pliku)
        const fileName = path.basename(file.originalname);  // Zwraca tylko nazwę pliku (np. a.png)
        cb(null, fileName);  // Zapisz tylko nazwę pliku (np. a.png)
    }
});

const upload = multer({ storage }).array('images', 5);  // Obsługuje wiele plików (maksymalnie 5)

router.get('/', (req, res) => {
    if (req.session.account.type !== 'admin') {
        return res.redirect('/');
    }

    res.render('admin/panel', {
        username: req.session.account.username,
    });
});

// Zarządzanie użytkownikami
router.get('/users', async (req, res) => {
    if (req.session.account.type !== 'admin') {
        return res.redirect('/');
    }

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

// Usuwanie użytkownika
router.post('/users/delete', async (req, res) => {
    const { id } = req.body;

    try {
        await User.findByIdAndDelete(id);
        res.redirect('/admin/users');
    } catch (err) {
        console.error('Błąd podczas usuwania użytkownika:', err);
        res.status(500).send('Coś poszło nie tak.');
    }
});

// Nadawanie uprawnień administratora
router.post('/users/assign-admin', async (req, res) => {
    const { id } = req.body;

    try {
        await User.findByIdAndUpdate(id, { type: 'admin' });
        res.redirect('/admin/users');
    } catch (err) {
        console.error('Błąd podczas nadawania uprawnień administratora:', err);
        res.status(500).send('Coś poszło nie tak.');
    }
});

// Zarządzanie produktami
router.get('/products', async (req, res) => {
    if (req.session.account.type !== 'admin') {
        return res.redirect('/');
    }

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

// Edycja/Przegląd produktu
router.get('/products/edit/:id?', async (req, res) => {
    if (req.session.account.type !== 'admin') {
        return res.redirect('/');
    }

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

// Dodawanie/edycja produktu z obsługą plików
router.post('/products', upload, async (req, res) => {
    const { id, name, price, description } = req.body;

    if (!name || !price || !description) {
        return res.status(400).send('Wszystkie pola są wymagane.');
    }
    const imageUrls = req.files ? req.files.map(file => file.filename) : [];  // Tylko nazwy plików

    try {
        const productData = { name, price, description, imageUrls };

        if (id) {
            // Jeśli mamy id, aktualizujemy produkt
            await Product.findByIdAndUpdate(id, productData);
        } else {
            // Jeśli nie mamy id, tworzymy nowy produkt
            const newProduct = new Product(productData);
            await newProduct.save();
        }

        res.redirect('/admin/products');
    } catch (err) {
        console.error('Błąd podczas zapisywania produktu:', err);
        res.status(500).send('Coś poszło nie tak.');
    }
});

// Usuwanie produktu
router.post('/products/delete', async (req, res) => {
    const { id } = req.body;

    try {
        await Product.findByIdAndDelete(id);
        res.redirect('/admin/products');
    } catch (err) {
        console.error('Błąd podczas usuwania produktu:', err);
        res.status(500).send('Coś poszło nie tak.');
    }
});

// Zarządzanie zamówieniami
router.get('/orders', async (req, res) => {
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

// Szczegóły zamówienia
router.get('/orders/:id', async (req, res) => {
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

// Zmiana statusu zamówienia
router.post('/orders/:id/status', async (req, res) => {
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
