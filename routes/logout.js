const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error during logout:', err);
                return res.status(500).send('A problem occurred during logout.');
            }
            res.redirect('/login');
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
