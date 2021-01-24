const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name!"]
    },
    email: {
        type:String,
        unique: true,
        required: [true, 'Please provide your email!'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    }, 
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function(el) {
                return el === this.password;
            },
            message: "Passwords are not the same!"
        }
    },
    passwordChangedAt: Date
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    // Hash the password with the cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    // Delete passwordConform field
    this.passwordConfirm = undefined;
    next();
});

// bcrypt will encrypt password and compare it with db's password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestap) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestap < changedTimestamp;
    }
    return false; // user has not been changed password after that timestamp
}

const User = mongoose.model("User", userSchema);
module.exports = User;