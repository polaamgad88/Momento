require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mongoSanitize = require("express-mongo-sanitize");
const MongoURI = 'mongodb+srv://' + process.env.mongoName + ':' + process.env.mongoPass + '@security.qhsfmpj.mongodb.net/test'
const helmet = require("helmet");
const xss = require("xss-clean");
const multer = require('multer');
const mongoDBStore = require('connect-mongodb-session')(session)
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
const store = new mongoDBStore({
  uri: MongoURI,
  collection: 'sessions'
})
const path = require("path");
const cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

const hpp = require("hpp");

var app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const Filter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// large file handler 
const ErrorHandler = (err, req, res, next) => {
  if (err) {
    res.status(413).render('413', { pageTitle: 'large File Provided', path: '/413', isAuthenticated: req.session.isLoggedIn || false });
  } else {
    next()
  }
}

app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ limit: '2mb', extended: true }));
app.use(bodyParser.json({ type: "application/*+json", inflate: false }));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'images')))
app.use(cookieParser());

app.use(session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: false,
  store: store,
  rolling: true,
  cookie: {
    expires: 10 * 60 * 1000,
  },
}))

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.set('views', 'views');

const { MongoDBStore } = require("connect-mongodb-session");
app.use(multer({ storage: fileStorage, fileFilter: Filter, limits: { fileSize: 100000 } }).single('image'), ErrorHandler);

app.use("/home",(req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'views' , 'index.html'))
});

app.use((req, res, next) => {
  res.status(404).send("404 not found")
});

mongoose.connect(
  MongoURI
).then((result) => {
  app.listen(3000)
  console.log('connected to database')
}).catch(err => {
  console.log(err)
})