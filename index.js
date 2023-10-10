const express=require('express');
require('dotenv').config();
var expressLayouts = require('express-ejs-layouts');   
const port = process.env.PORT;
const cloudinary = require('cloudinary').v2;
const cookieParser = require('cookie-parser');

// app.use(express.json());

const db=require('./config/mongoose');

const session = require('express-session');

const flash = require('connect-flash');

const app= express();
var bodyParser = require('body-parser')
app.use(express.static('assets'));



app.use(bodyParser.urlencoded({ extended: false }))

app.use(expressLayouts);

// parse application/json
app.use(bodyParser.json())

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
const MongoStore = require('connect-mongo');


// app.use(express.urlencoded({ extended: true }));

// cloudinary.config({ 
//     cloud_name: 'dw8rpoiil', 
//     api_key: '143649366316163', 
//     api_secret: 'GsZF65V_kqxrzhET0iYACVgTRJg' 
//   });

  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

  app.use(session({ 
    name: 'Hotel Manager',
    secret: 'your-secret-key',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    },
    store: MongoStore.create({

        mongoUrl: process.env.DATABASE_URL,
        autoRemove: 'disabled'

    },
    function(err){
        console.log(err || 'error in connect - mongodb setup ok');
    }
    )
}));


// setup view engin
app.set('view engine', 'ejs');
app.set('views', './views');


app.use('/', require('./routes'));

app.listen(port, function(err) {
    if (err) {
        console.log(`Error in running the server: ${err}`);
    }
    console.log(`Server is running on port: ${port} `);
})



