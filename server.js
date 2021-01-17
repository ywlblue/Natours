const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

// read environment variable from config file
dotenv.config({path: './config.env'});
// set password in host url
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {console.log("DB connection succeeds");});


// start server
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
})