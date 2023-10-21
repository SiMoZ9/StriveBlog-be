const jwt = require('jsonwebtoken')

module.exports = function(req, res, next) {
    const token = req.header('Authorization')

    if (!token) {
        res.status(401).send({
            statusCode: 401,
            message: 'Need a token to use this endpoint'
        })
    }

    try {
        const ver = jwt.verify(token, process.env.JWT_SECRET)
        req.user = ver

        next()
    } catch (err) {
        res.status(403).send({
            errorType: "Token error",
            statusCode: 403,
            message: "Token not valid or is expired"
        })
    }
}