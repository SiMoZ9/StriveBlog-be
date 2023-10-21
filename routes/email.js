const express = require('express')
const email = express.Router()
const {createTransport} = require('nodemailer')

const config = {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'zackary.hagenes@ethereal.email',
        pass: 'qNqTAFmHjtfhHD9XcX'
    }
}

const transporter = createTransport(config);

email.post('/send-email', async (req, res) => {
    const {recipient, subject, text} = req.body

    const mailOptions = { // composizione della mail
        from: "noreply@dajeatreni.com",
        to: config.auth.user,
        subject,
        text
    }

    // invio la mail

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
            res.status(500).send({
                statusCode: 500,
                message: "Internal server error"
            })
        } else {
            console.log("Email inviata")
            res.status(200).send({
                statusCode: 200,
                message: "Email inviata correttamente"
            })
        }
    })
})

module.exports = email