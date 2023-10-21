const express = require('express')
const postsModel = require('../models/postModel')
const mongoose = require("mongoose");
const commentsModel = require("../models/commentsModel");
const post = express.Router()
const multer = require('multer')
const crypto = require('crypto')
const cloudinary = require('cloudinary').v2
const {CloudinaryStorage} = require('multer-storage-cloudinary')
const verifyToken = require('../middlewares/verifyToken')
require('dotenv').config()


// configuro con i miei dati il cloud

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_NAME
})

const cloudStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'daje_a_treni',
        format: async (req, res) => 'png',
        public_id: (req, file) => file.name
    }
})

const internalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads') //posizione di salvo i file
  },
  // risolvere i conflitti di nomi
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}` //suffisso unico
    const extension = file.originalname.split('.').pop() //recupero estensione
    cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`) // callback con titolo completo
  }

})

const upload = multer({storage: internalStorage})
const cloudUpload = multer({storage: cloudStorage}) // storage del cloud

// all posts
post.get('/blogPosts', verifyToken,async (req, res) => {

    const {
        page = 1,
        pageSize = 5
    } = req.query

    const posts = await postsModel.find().limit(pageSize).skip((page - 1) * pageSize).populate('author').populate('comments')
    const totalPosts = await postsModel.count()

    try {

        if(!posts) {
            res.status(404).send(
                {
                    statusCode: 404,
                    message: "Posts not found"
                }
            )
        }

        res.status(200).send(
            {
                statusCode: 200,
                currentPage: Number(page),
                totalPages: Math.ceil(totalPosts / pageSize),
                totalPosts,
                posts
            }
        )
    } catch (e) {
        res.status(500).send(
            {
                statusCode: 500,
                message: "Internal server error"
            }
        )
    }
})

post.get('/blogPosts/:id', async (req, res) => {
  const {id} = req.params
  const posts = await postsModel.findById(id).populate('author')
  try {
    if (!posts) {
       res.status(404).send(
                {
                    statusCode: 404,
                    message: "Posts not found"
                }
            )

    }

    res.status(200).send(
                {
                    statusCode: 200,
                    message: "Here's your post",
        posts
                }
            )

    } catch (e) {
         res.status(500).send(
                {
                    statusCode: 500,
                    message: "Internal server error"
                }
            )
    }
  
})

post.post('/blogPosts/upload', upload.single('cover'), async (req, res) => {
  const url = `${req.protocol}://${req.get('host')}` // si prende dinamcamente l'indirizzo

  try {
    const imgUrl = req.file.filename
    res.status(200).json({ cover: `${url}/uploads/${imgUrl}`})
  } catch(e) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error"
        })
        console.log(e)
  }
})

post.post('/blogPosts/cloudUpload', cloudUpload.single('cover'), async (req, res) => {
    try {
        res.status(200).json({ cover: req.file.path})
    } catch(e) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error"
        })
        console.log(e)
    }
})


post.post('/blogPosts', async (req, res) => {
    const newPost = new postsModel({
        category: req.body.category,
        title: req.body.title,
        cover: req.body.cover,
  /*      readTime: {
            value: req.body.readTime.value,
            unit: req.body.readTime.unit
        }*/
//        author: req.body.author,
        content: req.body.content,
        //comments: req.body.comments
    })

    try {

        const postSave = await newPost.save()

        res.status(201).send({
            statusCode: 201,
            message: 'Post published successfully',
            postSave
        })
    } catch (err) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error"
        })
    }

})

post.put('/blogPosts/:id', async (req, res) => {
    const {id} = req.params

    try {
        const postToUpdate = await postsModel.findById(id)
        if(!postToUpdate) {
            res.status(404).send({
                statusCode: 404,
                message: 'User not found'
            })
        }

        const dataToUpdate = req.body;
        const options= { new: true };
        const result = await postsModel.findByIdAndUpdate(id, dataToUpdate, options)

        res.status(200).send({
            statusCode: 200,
            message: 'Post updated successfully',
            result
        })

    } catch (e) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error"
        })
    }
})
post.delete('/blogPosts/:id', async (req, res) => {
    const {id} = req.params

    try {
        const postToDelete = await postsModel.findByIdAndDelete(id)
        if(!postToDelete) {
            res.status(404).send({
                statusCode: 404,
                message: 'User not found'
            })
        }

        res.status(200).send({
            statusCode: 200,
            message: 'Post deleted successfully'
        })

    } catch(e) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error"
        })
    }
})

post.delete('/blogPosts/', async (req, res) => {
    try {
        const deleteAll = await postsModel.deleteMany()
        if (deleteAll) {
            console.log("Deleted")
            res.status(200).send({
                statusCode: 200,
                message: "Deleted successfully"
            })
        }
    } catch (e) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error"
        })
    }
})


// COMMENTS SECTION


module.exports = post
