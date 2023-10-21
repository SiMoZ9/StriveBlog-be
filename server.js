const express = require('express');
const mongoose = require('mongoose');
const authorsRoute = require('./routes/authors');
const postsRoute = require('./routes/posts')
const commentsRoute = require('./routes/comments')
const loginRoute = require('./routes/login')
const emailRoute = require('./routes/email')
const githubRoute = require('./routes/github')

const cors = require('cors')
const path = require('path')


require('dotenv').config()
const PORT = 5050;
const server = express();

server.use(cors())
server.use(express.json())

server.use('/uploads', express.static(path.join(__dirname, 'uploads')))

server.use('/', authorsRoute)
server.use('/', postsRoute)
server.use('/', commentsRoute)
server.use('/', emailRoute)
server.use('/', loginRoute)
server.use('/', githubRoute)

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error during db connection'))
db.once('open', () => {
    console.log('Database successfully connected!')
})

server.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}` )
});
