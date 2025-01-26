const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.get('/', (req, res) => {
    res.render('signup', { error: null }); 
});

router.post('/', async (req, res) => {
    const { username, password, confirmPassword, email } = req.body;

    try {
        if (!username || !password || !email) {
            return res.render('signup', { error: 'Wszystkie pola są wymagane.', username, email });
        }

        if (password !== confirmPassword) {
            return res.render('signup', { error: 'Hasła nie pasują.', username, email });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.render('signup', { error: 'Użytkownik o podanej nazwie lub e-mailu już istnieje.', username, email });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            typee: 'user', 
        });

        await newUser.save();

        // req.session.account = {
        //     id: newUser.userId,
        //     type: 'user',
        //     username: newUser.username,
        //     email: newUser.email,
        // };

        res.redirect('/login'); 
    } catch (err) {
        console.error(err);
        res.status(500).render('signup', { error: 'Coś poszło nie tak. Spróbuj ponownie.', username, email });
    }
});

module.exports = router;
