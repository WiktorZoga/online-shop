const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', (req, res) => {
    res.render('login', { 
        type: req.session.account ? req.session.account.type : 'guest',
        username: '',
        error: null
    });
});

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.render('login', {
                type: 'guest',
                username,
                error: 'Nieprawidłowa nazwa użytkownika lub hasło'
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.render('login', {
                type: 'guest',
                username,
                error: 'Nieprawidłowa nazwa użytkownika lub hasło'
            });
        }

        req.session.account = {
            id: user._id, 
            type: user.type,
            username: user.username,
            email: user.email
        };

        const redirectUrl = req.session.redirectAfterLogin || '/';
        delete req.session.redirectAfterLogin;

        res.redirect(redirectUrl);
    } catch (err) {
        console.error('Błąd podczas logowania:', err);
        res.status(500).send('Coś poszło nie tak. Spróbuj ponownie.');
    }
});

module.exports = router;
