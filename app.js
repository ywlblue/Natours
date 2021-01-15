const fs = require('fs');
const express = require('express');

const app = express();
// middleware can modifies incoming data
// express.json() is a middleware that can convert request to json format
app.use(express.json());

// app.get('/', (req, res) => {
//     res.status(200)
//     .json({message: 'Hello from the server side', app: 'Natours'});
// })

// app.post('/', (req, res) => {
//     res.send("You can post to this endpoint....")
// });

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            tours: tours
        }
        
    });
});

app.post('/api/v1/tours', (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    console.log(newId);
    // merge new id and data togther
    const newTour = Object.assign({id: newId}, req.body);
    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {
                newTour
            }
        });
    });
    console.log('Done');
});

const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
})