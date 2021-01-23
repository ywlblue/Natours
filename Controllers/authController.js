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
    })
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