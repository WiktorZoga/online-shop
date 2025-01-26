const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.get('/', async (req, res) => {
    if (!req.session.account || req.session.account.type === 'guest') {
        req.session.redirectAfterLogin = '/checkout'; 
        return res.redirect('/login'); 
    }

    if (!req.session.cart || req.session.cart.length === 0) {
        return res.redirect('/cart');
    }

    const totalQuantity = req.session.cart.reduce((sum, product) => sum + product.quantity, 0);
    const totalPrice = req.session.cart.reduce((sum, product) => sum + product.price * product.quantity, 0);

    res.render('checkout', {
        type: req.session.account.type,
        username: req.session.account.username,
        cart: req.session.cart,
        totalQuantity,
        totalPrice
    });
});

router.post('/', async (req, res) => {
    if (!req.session.account || req.session.account.type === 'guest') {
        req.session.redirectAfterLogin = '/checkout'; 
        return res.redirect('/login'); 
    }

    const { firstName, lastName, phone, city, shippingAddress, postalCode } = req.body;

    if (!req.session.cart || req.session.cart.length === 0) {
        return res.redirect('/cart');
    }

    try {
        const order = new Order({
            userId: req.session.account.id || null,
            items: req.session.cart.map(product => ({
                productId: product.id,
                quantity: product.quantity,
                name: product.name,
                price: product.price
            })),
            username: req.session.account.username,
            status: 'Oczekujące',
            shippingAddress: shippingAddress || 'Brak danych',
            city: city || 'Brak danych',
            postalCode: postalCode || 'Brak danych',
            phone: phone || 'Brak danych',
            firstName: firstName || 'Brak danych',
            lastName: lastName || 'Brak danych'
        });

        await order.calculateTotalPrice();

        await order.save();

        req.session.cart = [];

        req.session.message = "Dziękujemy za złożenie zamówienia!";

        res.redirect('/');
    } catch (err) {
        console.error('Błąd podczas składania zamówienia:', err);
        res.status(500).send('Coś poszło nie tak. Spróbuj ponownie.');
    }
});

module.exports = router;
