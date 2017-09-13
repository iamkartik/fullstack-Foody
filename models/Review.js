const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const reviewSchema = mongoose.Schema({
    created:{
        type:Date,
        default:Date.now
    },
    author:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        reqired:'You must supply an author'
    },
    store:{
        type:mongoose.Schema.ObjectId,
        ref:'Store',
        reqired:'You must supply a store'
    },
    text:{
        type:String,
        reqired:'You must provide a review text'
    },
    rating:{
        type:Number,
        min:1,
        max:5
    }
});

module.exports = mongoose.model('Review',reviewSchema);