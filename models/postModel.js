const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema({

    category: {
      type: String,
    },

    title: {
        type: String,
    },
    cover: {
        type: String,
    },
    readTime: {
        value: {
            type: Number,
        },
        unit:{
            type: String,
        },
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'authorModel'
    },

    content: {
        type: String,
    },

    comments: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'commentsModel'
      }]

  }, {timestamps: true, strict: true})

  module.exports = mongoose.model('postModel', PostSchema, 'posts')
