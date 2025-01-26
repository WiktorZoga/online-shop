const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, 
    username: {
        type: String,
        required: true 
    },
    items: [
        {
            productId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Product', 
                required: true 
            }, 
            quantity: { 
                type: Number, 
                required: true, 
                min: 1 
            },
            name: { 
                type: String, 
                required: true
            },
            price: { 
                type: Number, 
                required: true
            }
        }
    ],
    totalPrice: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        default: 'Oczekujące', 
        enum: ['Oczekujące', 'Zrealizowane', 'Anulowane']
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }, 
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
    shippingAddress: { 
        type: String, 
        required: true  
    },
    city: { 
        type: String, 
        required: true  
    },
    postalCode: { 
        type: String, 
        required: true  
    },
    phone: { 
        type: String, 
        required: true  
    },
    firstName: { 
        type: String, 
        required: true 
    },
    lastName: { 
        type: String, 
        required: true  
    }
});

orderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

orderSchema.methods.calculateTotalPrice = async function() {
    let totalPrice = 0;

    for (let item of this.items) {
        totalPrice += item.price * item.quantity; 
    }

    this.totalPrice = totalPrice;
};

module.exports = mongoose.model('Order', orderSchema);
