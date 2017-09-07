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
    tags:[String],
    // created date defaults to now
    created:{
        type:Date,
        default:Date.now
    },
    // location of the store ,with type as point lat and long and an address
    location:{
        type:{
            type:String,
            default:'Point'
        },
        coordinates:[{
            type:Number,
            required:'You must supply coordinates'
        }],
        address:{
            type:String,
            required:'You must provide an address'
        }
    },
    photo:String
});

// before saving the store data , generate a slug - unique url for the store
// this will act as a middleare call next to go to save
// use function instead of arrow , this context remains same in function whereas in => it changes
storeSchema.pre('save',async function(next){
    // generate slug only if the name has been modified
    if(!this.isModified('name')){
        next(); //skip slug generation and return 
        return;
    }
    this.slug = slug(this.name);
    // find any other store with the same slug burger-king delhi/mumbai
    // create regex to search 
    // starts with burger-king and can end with  -1/-2 ... 
    const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)`,'i');
    // this.constructor equals to Store model 
    const storesWithSlug = await this.constructor.find({ slug:slugRegex });
    if(storesWithSlug.length){
        this.slug=`${this.slug}-${storesWithSlug.length + 1}`;
    }
    next();
});


// export the object
// using module.exports you can export the entire object
// exports only exports the function/obj it is used for
// require returns module.exports and not exports

// name of model is capitalized
module.exports = mongoose.model('Store',storeSchema);