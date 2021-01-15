const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// 1) MIDDLEWARES
app.use(morgan('dev')); // log

// middleware can modifies incoming data
// express.json() is a middleware that can convert request to json format
app.use(express.json());

// customized middleware function
// order of middleware matters
app.use((req, res, next) => {
    console.log("Hello from the middleware!");
    // always call next in middleware
    next(); 
});

// 2) HANDLERS
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            tours: tours
        }
        
    });
}

const getTour = (req, res) => {
    // convert id to integer
    const id = req.params.id * 1;
    const tour = tours.find(el => el.id === id);
    if (!tour) {
        return res.status(404).json({
            status: "fail",
            data: {
                message: 'Could not find tour'
            }
        });
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
        
    });
}

const createTour = (req, res) => {
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
}

const updateTour = (req, res) => {
    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour here>'
        }
    });
}

const deleteTour = (req, res) => {
    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
}

// 3) ROUTES
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// cleaner way to route at same url w/ different request method
app
    .route('/api/v1/tours')
    .get(getAllTours)
    .post(createTour);

app
    .route('/api/v1/tours/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
})