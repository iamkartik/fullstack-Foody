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
    photo:String,
    // author field , who created the store listing
    // linking the user model with store 
    author:{
        // author id is of type _id( ObjectId ) like foreign key in sql
        type:mongoose.Schema.ObjectId,
        ref:'User',// tell that User will be referenced 
        required:true
    }
},// adding options to include virtual fields(reviews) while converting to json/object
  // by default they are not included  
{   
    toJSON:{ virtuals:true },
    toObject:{ virtuals:true }
});

// define our index , tell which fields should be indexed
// name of store and description are indexed as text for searching 
// name_text_description_text is the final compound index both used together
// https://docs.mongodb.com/manual/core/index-compound/
storeSchema.index({
    name:'text',
    description:'text'
});

// adding the geospatial index  location for searching on map/ near me feature
storeSchema.index({
    location:'2dsphere'
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

// TODO:: add sanitization for xss before saving

// adding statics makes this a  function of the Store schema
// using function here instead of () as this is required bound to the Store model and not the global this
storeSchema.statics.getTagsList = function(){
    // aggregate takes in an array as input 
    // operators of aggregate allow for further filtering of data , group by , order by etc
    // https://docs.mongodb.com/manual/aggregation/
    // https://docs.mongodb.com/v3.2/reference/sql-aggregation-comparison/ 
    // each operation is an object in the pipeline(array)
    return this.aggregate([
        // unwind - seperate on the basis of tags and for each tag have an instace of store(duplicate the data)
        // ie {name:abc, tags:[x,y,c]} => {name:abc, tags:x},{name:abc, tags:y},{name:abc, tags:z}
        { $unwind:'$tags'},
        // after unwinding group the similar ones(based on tag ) and count 
        // group will return a new object with id of tag name and a count
        // count returns an value which is updated by sum , adding 1 to prev count
        { $group:{ _id:'$tags',count:{ $sum:1 } } },
        // finally sort the data ,based on tag count 1 ASC , -1 DSC 
        { $sort:{ count:-1 } }
    ]);
}

// Using virtual attributes to fetch reviews from the review schema .(JOIN data from 2 models)
// Virtual attributes are attributes
// that are convenient to have around but that do not get persisted to mongodb.
// insted of getting data (gravatar in User.js ) passing an object to tell mongoose where to look for the data
storeSchema.virtual('reviews',{
    ref:'Review',// which model to look in for data
    localField:'_id', // which field of our current store needs to match
    foreignField:'store'// to which field it matches to inside review
    // ie store._id is being checked in review, inside review it is stored in 'store' field
});


// export the object
// using module.exports you can export the entire object
// exports only exports the function/obj it is used for
// require returns module.exports and not exports

// name of model is capitalized
module.exports = mongoose.model('Store',storeSchema);