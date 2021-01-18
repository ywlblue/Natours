const Tour = require('./../models/tourModels');

// MIDDLEWARE to prefill query object for searching top 5 tours
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5',
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = async (req, res) => {
    try {
        //// BUILD QUERY ////
        // 1A) deep copy query
        const queryObj = {...req.query}
        // query filter
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1B) Advance filtering
        // replace gte, gt, lte, lt with $ in front
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
       
        // Need to parse into JSON
        let query = Tour.find(JSON.parse(queryStr));
        
        // 2) Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }
        
        // 3) Field Limiting - project
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            console.log(fields);
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // 4) Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 1;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip > numTours) throw new Error('This page does not exist');
        } 
         // EXECUTE QUERY
        const tours = await query;
        
        // const query = await Tour.find()
        //     .where('duration')
        //     .equals(5)
        //     .where('difficulty')
        //     .equals('easy');
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
            
        });
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

exports.getTour = async (req, res) => {
    try {
        // Tour.findOne({_id: req.params.id});
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: 'Invalid data set!'
        })
    }
};

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(204).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
    
};

exports.deleteTour = async (req, res) => {
    try {
        // don't send any data back if delete
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};