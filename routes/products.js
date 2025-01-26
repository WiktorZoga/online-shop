const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
    const searchQuery = req.query.search || ''; 
    
    req.session.searchQuery = searchQuery;

    try {
        let products = [];

        if (searchQuery) {
            const regex = new RegExp(searchQuery, 'i');
            products = await Product.find({ name: regex });
        } else {
            products = await Product.find({});
        }

        res.render('products', { 
            type: req.session.account.type,
            username: req.session.account.username,
            cart: req.session.cart,
            products,
            searchQuery,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd po stronie serwera.');
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    const searchQuery = req.session.searchQuery || '';  
    
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).send('Produkt nie znaleziony');
        }

        res.render('product-details', {  
            product,
            searchQuery,  
            type: req.session.account.type,
            username: req.session.account.username,
            cart: req.session.cart
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd po stronie serwera.');
    }
});

router.post('/add', (req, res) => {
    const { id, name, price, quantity } = req.body;
    const cart = req.session.cart || [];
    const existingProduct = cart.find(item => item.id === id);

    const searchQuery = req.body.searchQuery || req.session.searchQuery;

    if (existingProduct) {
        existingProduct.quantity += parseInt(quantity, 10);
    } else {
        cart.push({ id, name, price, quantity: parseInt(quantity, 10) });
    }

    req.session.cart = cart;
    req.session.searchQuery = searchQuery;  

    res.redirect(`/products?search=${encodeURIComponent(searchQuery)}`);
});

module.exports = router;
