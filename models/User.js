const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
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
    },
    resetPasswordToken:String,// token and expires in case user forgets his/her password 
    resetPasswordExpires:Date,
    // adding a new field hearts to store what stores you have liked
    // hearts will be an array containg the storeId's of the stores liked
    hearts:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'Store'
        }
    ]
},{   
    toJSON:{ virtuals:true },
    toObject:{ virtuals:true }
});

// add a gravatar as a virtaula field , not being stored in the db , but pulling on the fly
userSchema.virtual('gravatar').get(function(){
    // can return a static url to an image 
    // return `http://entertainment.inquirer.net/files/2016/07/13717225_1265259390150735_8093269019210020606_o.jpg`;
    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=200`;
});

// plug the passport local mongoose to add the required fields and methods for login and auth(password etc)
// tell passport that username will be email
// also causes email to become the index field for searching
userSchema.plugin(passportLocalMongoose,{usernameField:'email'});

// add error handler plugin to transform mangodb errors into readable errors (for unique field)
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User',userSchema);