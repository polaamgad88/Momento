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
const nodemailer = require('nodemailer')
const Products = require('./models/products')
let transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL,
    pass: process.env.PASS,
  }
})
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
app.set('view engine', 'ejs');

const { MongoDBStore } = require("connect-mongodb-session");
app.use(multer({ storage: fileStorage, fileFilter: Filter, limits: { fileSize: 100000 } }).single('image'), ErrorHandler);

app.use("/home_ar", (req, res, next) => {
  Products.findAll()
    .then(([result, meta]) => {
      console.log(result)
      res.status(200).render('index-ar.ejs', { image: result[0].product_image, data: result[0]['description-ar'], name: result[0]['product_name-ar'] })
    })
    .catch((err) => {
      console.log(err)
    });

});
app.get("/product", (req, res, next) => {
  console.log(req.query.section)
  res.status(200).render('products.ejs', { destination: req.query.section })
});
app.use("/home", (req, res, next) => {
  Products.findAll()
    .then(([result, meta]) => {
      console.log(result)
      res.status(200).render('index.ejs', { image: result[0].product_image, data: result[0].description, name: result[0].product_name })
    })
    .catch((err) => {
      console.log(err)
    });

});
app.post("/send_mail", (req, res, next) => {
  console.log(req.body)
  const d = new Date();
  res.status(200).send("OK")
  let options = {
    from: process.env.MAIL,
    to: "polaamgad288@gmail.com",
    subject: 'MOMENTO CONTACT US',
    text:
      `name: ` + req.body.name + '\n' +
      `mail: ` + req.body.email + '\n' +
      `subject: ` + req.body.subject + '\n' +
      `contant: ` + req.body.message
  }
  transport.sendMail(options, (err, data) => {
    if (err)
      console.log(err)
    else
      console.log('done')
  })
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