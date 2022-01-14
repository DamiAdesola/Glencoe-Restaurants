const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: true 
    },
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    aboutme: {
        type: String,
    },
    location: {
        type: String,
    },
    privacy: { 
        type: Boolean, 
        required: true 
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
})

module.exports = mongoose.model('user', UserSchema)
