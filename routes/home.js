const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const message = req.session.message;
    delete req.session.message;
    res.render('home', {
        type: req.session.account.type,
        username: req.session.account.username,
        cart: req.session.cart,
        message: message 
    });
});


module.exports = router;
