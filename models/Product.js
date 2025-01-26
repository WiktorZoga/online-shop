const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrls: { type: [String], default: [] }  // Tablica przechowująca ścieżki do zdjęć
});

module.exports = mongoose.model('Product', productSchema);
