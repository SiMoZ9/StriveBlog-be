const express = require('express');
const login = express.Router()
const bcrypt = require('bcrypt')
const authorModel = require('../models/authorModel')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// solo post ovviamente

login.post('/login', async (req, res) => {
    //recupero l'utente
    const user = await authorModel.findOne({ email: req.body.email })

    if (!user) {
        return res.status(404).send({
            statusCode: 404,
            message: 'User not found'
        })
    }

    console.log(user.password)

    // controllo la validità della password

    const validPwd = await bcrypt.compare(req.body.password, user.password)

    console.log(validPwd)

    if (!validPwd) {
        return res.status(400).send({
            statusCode: 400,
            message: 'Email or password are incorrect'
        })
    }

    // generazione token
    /*
    * Tutto ciò che voglio che mi ritorni criptato
    * */
    const token = jwt.sign({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    }, process.env.JWT_SECRET, {
        expiresIn: '72h'
    })

    res.header('Authorization', token).status(200).send({
        message: "Login effettuato con successo",
        statusCode: 200,
        token
    })
})

module.exports = login;