const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
// TODO:: change md5 to sha512
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema= new Schema({
    email:{
        type:String,
        unique:true, // email id is unique
        lowercase:true,// always store in lowercase
        trim:true,
        //check with validator.isEmail , if not a email then show error msg
        validate:[validator.isEmail ,'Invalid Email Address'],
        required:'Please supply an Email address' 
    },
    name:{
        type:String,
        required:'Please provide a name',
        trim:true
    }
});

// plug the passport local mongoose to add the required fields and methods for login and auth(password etc)
// tell passport that username will be email
userSchema.plugin(passportLocalMongoose,{usernameField:'email'});

// add error handler plugin to transform mangodb errors into readable errors (for unique field)
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User',userSchema);