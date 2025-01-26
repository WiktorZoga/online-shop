const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const cart = req.session.cart || [];
    
    let totalQuantity = 0;
    let totalPrice = 0;

    cart.forEach(product => {
        totalQuantity += product.quantity;
        totalPrice += product.price * product.quantity;
    });

    res.render('cart', {
        type: req.session.account.type,
        cart: cart,
        username: req.session.account,
        totalQuantity: totalQuantity,
        totalPrice: totalPrice
    });
});

router.post('/add', (req, res) => {
    const { id, name, price, quantity } = req.body;
    const cart = req.session.cart || [];

    const existingProduct = cart.find(item => item.id === id);
    if (existingProduct) {
        existingProduct.quantity += parseInt(quantity, 10);
    } else {
        cart.push({ id, name, price, quantity: parseInt(quantity, 10) });
    }

    req.session.cart = cart;
    res.redirect('/cart');
});

router.post('/remove', (req, res) => {
    const { id } = req.body;
    req.session.cart = req.session.cart.filter(item => item.id !== id); 
    res.redirect('/cart');
});

router.post('/increase', (req, res) => {
    const { id } = req.body;
    const cart = req.session.cart || [];

    const product = cart.find(item => item.id === id);
    if (product) {
        product.quantity++;
    }

    req.session.cart = cart;
    res.redirect('/cart');
});

router.post('/decrease', (req, res) => {
    const { id } = req.body;
    const cart = req.session.cart || [];

    const product = cart.find(item => item.id === id);
    if (product && product.quantity > 1) {
        product.quantity--;
    } else if (product && product.quantity === 1) {
        req.session.cart = req.session.cart.filter(item => item.id !== id); 
    }
    res.redirect('/cart');
});

router.post('/clear', (req, res) => {
    req.session.cart = [];
    res.redirect('/cart');
});

router.post('/checkout', (req, res) => {
    res.redirect('/checkout');
});

module.exports = router;
