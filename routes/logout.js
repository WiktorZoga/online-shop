const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Błąd podczas wylogowywania:', err);
                return res.status(500).send('Błąd wystąpił podczas wylogowywania.');
            }
            res.redirect('/login');
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
