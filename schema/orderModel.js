const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    restaurantID: {
        type: Number,
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    products: {
        type: Object,
        required: true
    },
});

module.exports = mongoose.model('Order', OrderSchema);
