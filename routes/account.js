const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User'); 

const renderWithError = (res, errorMessage, type, username, email) => {
    return res.render('account', {
        type,
        username,
        email,
        error: errorMessage
    });
};

router.get('/', (req, res) => {
    if (req.session.account.type === 'guest') {
        return res.redirect('/login');
    }

    const { type, username, email } = req.session.account;
    res.render('account', {
        type,
        username,
        email,
        error: null
    });
});

router.post('/update', async (req, res) => {
    const id = req.session.account.id; 
    const { username, email, password, confirmPassword, currentPassword } = req.body;

    if (!currentPassword) {
        return renderWithError(res, 'Stare hasło jest wymagane do każdej zmiany.', req.session.account.type, req.session.account.username, req.session.account.email);
    }

    const user = await User.findById(id);
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
        return renderWithError(res, 'Stare hasło jest niepoprawne.', req.session.account.type, req.session.account.username, req.session.account.email);
    }

    try {
        let updateData = {};

        if (username && username !== user.username) {
            if (!username.trim()) {
                return renderWithError(res, 'Nazwa użytkownika nie może być pusta.', req.session.account.type, req.session.account.username, req.session.account.email);
            }
            updateData.username = username;
        }

        if (email && email !== user.email) {
            if (!email.trim()) {
                return renderWithError(res, 'Email nie może być pusty.', req.session.account.type, req.session.account.username, req.session.account.email);
            }
            updateData.email = email;
        }

        if (password && password !== '' && confirmPassword && confirmPassword !== '') {
            if (password !== confirmPassword) {
                return renderWithError(res, 'Hasła nie pasują.', req.session.account.type, req.session.account.username, req.session.account.email);
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        if (Object.keys(updateData).length > 0) {
            const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

            req.session.account.username = updatedUser.username;
            req.session.account.email = updatedUser.email;

            res.redirect('/account');
        } else {
            return renderWithError(res, 'Brak danych do zaktualizowania.', req.session.account.type, req.session.account.username, req.session.account.email);
        }

    } catch (error) {
        console.error(error);
        return renderWithError(res, 'Wystąpił błąd podczas aktualizacji danych.', req.session.account.type, req.session.account.username, req.session.account.email);
    }
});

module.exports = router;
