const mongoose = require('mongoose')

const CommentsSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'postModel',
    },

    title: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    },
}, {timestamps: true, strict: true}
)
module.exports = mongoose.model('commentsModel', CommentsSchema, 'comments')
