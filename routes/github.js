const express = require('express')
const gh = express.Router()
const passport = require('passport')
const GithubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken')
const session = require('express-session')
const User = require('../models/authorModel')
require('dotenv').config()


gh.use(
    session({
        secret: process.env.GITHUB_CLIENT_SECRET,
        resave: false,
        saveUninitialized: false,
    })
)


gh.use(passport.initialize())
gh.use(passport.session())

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

passport.use(
    new GithubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            scope: ['user:email'],
            callbackURL: process.env.GITHUB_CALLBACK,
        },
        async (accessToken, refreshToken, profile, done) => {
            const githubId = profile.id
            const name = profile.displayName

/*            const existingUser = await User.findOne(email)

            console.log(email)

            if (existingUser) {
                return done(null, profile)
            } else {
                const newUser = await User.create({githubId, name, email})
                done(null, newUser)
            }*/
        }
    )
)

gh.get('/auth/github', passport.authenticate('github', { scope: ['user:email']}), (req, res) => {
    const redirectUrl = `${process.env.REACT_URL}/success?user=${encodeURIComponent(JSON.stringify(req.user))}`
    res.redirect(redirectUrl)
})

gh.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    const user = req.user
    console.log('LOG USER', user)

    const token = jwt.sign(user, process.env.JWT_SECRET)
    const redirectUrl = `${process.env.REACT_URL}/success/${encodeURIComponent(token)}`
    res.redirect(redirectUrl)
})

gh.get('/success', (req, res) => {
    res.redirect(`${process.env.REACT_URL}/home`)
})

module.exports = gh;