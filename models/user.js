const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },   
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }]
});

//we are hashing the password
UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

//we are generating token
//this keyword doesn't work with fat arrow function 
UserSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, 'secretkey');
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    }
    catch (err) {
        console.log(err);
    }
}

//collection creation
const User = mongoose.model('User', UserSchema);
module.exports = User;

