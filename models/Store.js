// model name is capilalized
const mongoose = require('mongoose');
// tell mongoose to use node es6 promises / bluebird etc.
mongoose.Promise = global.Promise;
// slugs is used to make strings url-safe
const slug = require('slugs');

// define schema
const storeSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:'Please enter a store name !'// instead of true/false , we give the error returned 
                                              //  in case name is not provided
    },
    slug:String,
    description:{
        type:String,
        trim:true
    },
    tags:[String]
});

// before saving the store data , generate a slug - unique url for the store
// this will act as a middleare call next to go to save
// use function instead of arrow , this context remains same in function whereas in => it changes
storeSchema.pre('save',function(next){
    // generate slug only if the name has been modified
    if(!this.isModified('name')){
        next(); //skip slug generation and return 
        return;
    }
    this.slug = slug(this.name);
    next();
});


// export the object
// using module.exports you can export the entire object
// exports only exports the function/obj it is used for
// require returns module.exports and not exports

// name of model is capitalized
module.exports = mongoose.model('Store',storeSchema);