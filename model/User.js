const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const UserSchema = new Schema({
    name : {
        type: String,
        requred: true
    },
    email : {
        type: String,
        requred: true
    },
    password : {
        type: String,
        requred: true
    },
    avatar : {
        type: String
    },
    date : {
        type: Date,
        default: Date.now
    }

});

module.exports = User = mongoose.model('users', UserSchema);