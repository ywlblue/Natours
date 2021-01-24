const { promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    const token = signToken(newUser._id);
    res.status(201).json({
        status: 'success',
        token: token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync (async (req, res, next) => {
    const { email, password } = req.body;

    // 1) check if email and password exists
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) check if use exists and password is correct
    // because we set select password to false, in here, we need to select it explicitly by using +
    const user = await User.findOne({ email }).select('+password');

    // Avoid hacker knows what's wrong exactly, we say incorrect password or email together
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) if everything ok, send token to client
    const token = signToken(user._id);
    res.status(200).json({
        status: "success",
        token
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) get token and check if it exists
    let token = '';
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access', 401));
    }
    // 2) verifiy token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3) check if user still exists
    // what if the user change the password after token is issued..
    // what if the user is deleted, but the token is still valid...
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }
    // 4) check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    // Grant access to protected route
    req.user = freshUser;
    next();
});

// verify if a certain user is allowed to access resourses.
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        console.log(req.user.role);
        // Restrict to roles ['admin', 'lead-guide'], role ='user' does not
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    }
}