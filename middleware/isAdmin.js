module.exports = (req, res, next) => {
    if (req.session.account && req.session.account.type === 'admin') {
        return next();
    } else {
        return res.redirect('/');
    }
};
