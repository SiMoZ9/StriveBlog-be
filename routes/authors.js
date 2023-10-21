const express = require('express')
const authorModel = require('../models/authorModel')
const postsModel = require("../models/postModel");
const verifyToken = require('../middlewares/verifyToken')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const authors = express.Router()

authors.get('/authors', async (req, res) => {
    try {
        const author = await authorModel.find() //li trova tutti
        res.status(200).send({
            statusCode: 200,
            message: 'List',
            author
        })
    } catch (err) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            err
        })
    }
})

authors.get('/author/me', verifyToken,async (req, res) => {
    const userToken = req.headers.authorization
    const token = userToken.split(' ')[0]
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    try {
        const author = await authorModel.findOne({email: payload.email})
        if (!author) {
            res.status(404).send({
                message: "User not found",
                statusCode: 404
            })
        } else {
            res.status(200).send({
                statusCode: 200,
                author
            })
        }
    } catch (err) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error",
        })
    }
})

authors.get('/authors/byId/:id', async (req, res) => {
    const { id } = req.params
    console.log(req.params)
    try {
        const author = await authorModel.findById(id)

        if (!author) {
            res.status(404).send({
                statusCode: 404,
                message: "Not Found",
            })
        }

        res.status(200).send({ statusCode: 200, message: `Author found`, author })

    } catch (err) {
        res.status(200).send({ statusCode: 200, message: 'Internal server error', err})
    }
})

authors.get('/authors/:id/blogPosts', async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
        const postByUserId = await postsModel.find({
            content: {
                $regex: id,
                $options: 'i'
            }
        })

        const author = await authorModel.findById(id)

        if (!author) {
            res.status(404).send({ statusCode: 404, message: "User Not Found"})
        }

        res.status(200).send({ statusCode: 200, message: `All posts `, postByUserId })
    } catch (e) {
        res.status(500).send({
            statusCode: 500,
            message: "Errore interno del server"
        })
    }
})


authors.post('/authors/create', async (req, res) => {
    // scelgo la compessità dell'algoritmo di criptazione
    const salt = await bcrypt.genSalt(10)
    // creo l'hash della password
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    // hashedPassword prende il puntatore di req.body.password e lo cripta

    const newAuthor = new authorModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        birth: req.body.birth,
        avatar: req.body.avatar
    })

    try {
        const saveAuthor = await newAuthor.save()

        res.status(201).send({
            statusCode: 201,
            message: 'Author created',
            payload: saveAuthor,
        })
    } catch (err) {
        res.status(500).send({
            statusCode: 500,
            message: err
        })
    }

})

authors.put('/authors/update/:id', async (req, res) => {
    const {id} = req.params

    try {
        const authorToUpdate = await authorModel.findById(id)
        if(!authorToUpdate) {
            res.status(404).send({
                statusCode: 404,
                message: 'User not found'
            })
        }

        const dataToUpdate = req.body;
        const options= { new: true };
        const result = await authorModel.findByIdAndUpdate(id, dataToUpdate, options)

        res.status(200).send({
            statusCode: 200,
            message: 'User updated successfully',
            result
        })

    } catch (e) {
        res.status(500).send({
            statusCode: 500,
            message: 'Internal server error'
        })
    }
})

authors.delete('/authors/delete/:authorId', async (req, res) => {
    const { authorId } = req.params;

    try {
        const author = await authorModel.findByIdAndDelete(authorId)
        if (!author) {
            return res.status(404).send({
                statusCode: 404,
                message: "Post not found or already deleted!"
            })
        }

        res.status(200).send({
            statusCode: 200,
            message: "Post deleted successfully"
        })

    } catch (e) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal Server Error"
        })
    }
})



module.exports = authors