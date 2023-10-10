const mongoose = require('mongoose');

// mongoose.connect('mongodb+srv://rpbarmaiya:mD9bbUM3HCKRjfxv@cluster0.5pzfsyi.mongodb.net/?retryWrites=true&w=majority')
// mongoose.connect('mongodb://localhost/hotel_db');
mongoose.connect(process.env.DATABASE_URL)




//accuire the connectiontion
const db = mongoose.connection;


//error
db.on('error', console.error.bind(console, 'error in connecting to db'));

//up and runnning
db.once('open', function() {
    console.log("successfully connected to the database");
});