const express = require('express');
const path = require('path');
const config = require('./config/database');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();

console.log('MongoDB URI:', config.database);  

mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.log('Error connecting to MongoDB:', err); 
    });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('public/uploads'));
app.use(session({
    secret: "SECRET",
    resave: false,
    saveUninitialized: true,
}));

app.use((req, res, cb) => {
    req.session.account = req.session.account || {id: null, type : 'guest', username: ''};
    req.session.cart = req.session.cart || [];
    res.locals.currentPath = req.path;
    cb();
});

app.use('/', require('./routes/home'));      
app.use('/account', require('./routes/account'));  
app.use('/admin', require('./routes/admin'));    
app.use('/cart', require('./routes/cart'));      
app.use('/checkout', require('./routes/checkout')); 
app.use('/login', require('./routes/login'));    
app.use('/logout', require('./routes/logout'));  
app.use('/products', require('./routes/products'));
app.use('/signup', require('./routes/signup'));

app.use((req, res) => {
    res.status(404).send('Page not found');
});

const port = 4000;
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}/`);
});
