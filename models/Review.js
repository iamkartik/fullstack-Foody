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

// the function will automatically populate the author field whenever the review data is fetched
// for reviewer's name and gravatar
function autoPopulate(next){
    // adding second param to only include author's name and gravatar
    // email is required as the gravatar is being created on the basis of email (dependent on email)
    // otherwise undefined error will be thrown
    this.populate('author','email gravatar name');
    next();
}

// adding the hook to run before finding the document
reviewSchema.pre('find',autoPopulate);
reviewSchema.pre('findOne',autoPopulate);

module.exports = mongoose.model('Review',reviewSchema);