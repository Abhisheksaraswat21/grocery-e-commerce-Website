require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3300
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)
const passport = require('passport')
const Emitter = require('events')

// Database connection
mongoose.connect(process.env.MONGO_CONNECTION_URL, { useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true, useFindAndModify : true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected...');
}).catch(err => {
    console.log('Connection failed...')
});


// Session store
let mongoStore = new MongoDbStore({
                mongooseConnection: connection,
                collection: 'sessions'
            })

// Event emitter
const eventEmitter = new Emitter()

//ab hum eventemitter ke naam se evenetemitter kahi pe bhi use kpayenge application me--
app.set('eventEmitter', eventEmitter)

// Session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hour
}))

// Passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
// Assets
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})
// set Template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')

require('./routes/web')(app)
app.use((req, res) => {
    res.status(404).render('errors/404')
})

const server = app.listen(PORT , () => {
            console.log(`Listening on port ${PORT}`)
        })

// Socket
//we passed server in it to get to know ki oknsa server use lrna haib socket ke liye
const io = require('socket.io')(server)
io.on('connection', (socket) => {


    //we wan to use private rooms for each user so that changs made in one wouldnt affect others

    // Join

    //join naam ki event receive krre hai yaha pe hum log
    //aur waha se jo daat send krre hai wo yaha receive hojata hai
      socket.on('join', (orderId) => {

        //ye wala socket ka method hai...ab order id naam se room create hojayega aur hum
        //usme join hojayenhge
        socket.join(orderId)
      })
})
//jese hi orderupdated emit hota hia tb hi hume
eventEmitter.on('orderUpdated', (data) => {
    //konse room me emit krna hai wo to me aayega
    // emit ke baad jo hai uska mtlb hai ki is naam se client pe listen krenge (app.js me)
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

//ab admin.js me hum isko use krlenge
eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})

