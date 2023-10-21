const mongoose = require('mongoose')

const AuthorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
      type: String,
      required: true,
      min: 8
    },
    birth: {
        type: String,
    },
    avatar: {
        type: String,

    }
}, {timestamps: true, strict: true})

module.exports = mongoose.model('authorModel', AuthorSchema, 'authors')