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
});

// Handle unhandled rejection
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! Shutting down!')
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
})

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! Shutting down!')
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
    console.log()
});