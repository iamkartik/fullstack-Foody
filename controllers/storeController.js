// exports is a global variable 
// whatever follows exports can be imported in another file
const mongoose = require('mongoose');
// Store is already imported in start.js
// now is available to mongoose 
const Store = mongoose.model('Store');
// multer allows to handle and access multipart data which is req in case of file upload
const multer = require('multer');
// jimp package for resizing the images
const jimp = require('jimp');
// uuid to make each image name unique
const uuid = require('uuid'); 

// options for multer , where to store the uploaded file and what extensions are allowed
const multerOptions = {
    storage:multer.memoryStorage(),// storing the file in memory to resize and save to disk later
    fileFilter:(req,file,next)=>{ 
        // this function allows us to pass the file if it's a photo otherwise reject it
        // check for the mime type of the file
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto){
            // no err pass true as callback
            next(null,true);
        }else{
            // set error and pass false
            next({message:'The filetype is not allowed'},false);
        }
    }
};

// index page render
exports.homePage = (req,res)=>{
    res.render('index');
};

// render the add store page
exports.addStore = (req,res)=>{
    // use edit store to add/edit store
    res.render('editStore',{title:'Add a new Store !'});
};

// middleware before creating a new store to handle file upload
// .single() is used so that the check is only in the photo field of store form
exports.upload = multer(multerOptions).single('photo');

// after upload middleware the uploaded file is still in memory it needs to be resized
exports.resize = async (req,res,next)=>{
    // check if there is no new file to resize 
    // multer will put the file in req.file property
    if(!req.file) {
        next();// skip to next middleware(createStore)
        return;
    }    
    // mimetype will be like image/jpeg
    const extension = req.file.mimetype.split('/')[1];
    // unique photo name stored in body to be added in db
    req.body.photo = `${uuid.v4()}.${extension}`;
    // resize the photo , pass jimp filepath or buffer. Buffer is present in memory
    const photo = await jimp.read(req.file.buffer);
    // resize photo to 800 width and auto height
    await photo.resize(800,jimp.AUTO);
    // write to disk
    await photo.write(`./public/uploads/${req.body.photo}`);
    next();
}

exports.createStore = async (req,res)=>{
    // adding the author as the person who is currently logged in
    req.body.author = req.user._id;
    // because we are using a strict schema 
    // any other params in req.body will be rejected
    // we need slug info that is auto generated
    // .save() actual saves the data
    const store = await (new Store(req.body)).save();
    // use flash to flash a message, flash added to req in app.js
    // flash takes 2 params type , msg , flashes will happen on the next req that comes to the server
    req.flash('success',`You have successfully added ${store.name} !`); 
    res.redirect(`/stores/${store.slug}`);
}

exports.getStores = async (req,res)=>{
    // get all stores
    const stores =await Store.find();
    // if property name equals the value name ,no need to pass the key explicitly
    res.render('stores',{title:'Stores',stores});
}
// if use async on a functionwithout await it will pass on to next line
const confirmOwner = (store,user)=>{
    if(!store.author.equals(user._id)){
        throw Error('You must be a store owner in order to edit it!');        
    }
};

exports.editStore = async (req,res)=>{   
    // get the store with the id , id in req.params(in url)
    const store = await Store.findOne({ _id:req.params.id });
    //first confirm that the editor is the actual owner/ author of the page
    confirmOwner(store,req.user);
    // store key is not required
    res.render('editStore',{title:`Edit ${store.name}`,store});
}

exports.updateStore = async (req,res)=>{
    // explicitly setting the location type to be point, on upate it may not update itself
    req.body.location.type = 'Point';
    // find the store and update
    const store = await Store.findOneAndUpdate({ _id:req.params.id },req.body,{
        new:true, // return the updated store rather than the old one
        runValidators:true //the required fields only run on creation , 
                           // runValidators forces them to run during edit
    }).exec();// exec to run the query
    req.flash('success',`Successfully updated <strong>${store.name}</strong>.
                <a href="/stores/${store.slug}">View Store</a>`);
    res.redirect(`/stores/${store._id}/edit`);            
}

exports.getStoreBySlug = async (req,res,next)=>{
    // by adding populate we are asking to fetch the author's user data as well to be fetched
    const store = await Store.findOne({slug:req.params.slug});
                                // .populate('author');
    // if no store is found go to 404 middleware
    if(!store){
        next();
        return;
    }
    res.render('store',{store,title:store.name});
}

exports.getStoresByTag = async (req,res)=>{
    const currentTag = req.params.tag;
    // get all stores on initial render of tags page
    // $exists:true will return all where there is a tag property
    const tagQuery = currentTag || {$exists:true} ;   
    // in order to get data in parallel remove await and get the promise for tagList
    const tagsPromise = Store.getTagsList();
    // get the storePromise to get the stores where current tag is in the list of tags 
    const storesPromise = Store.find({ tags:tagQuery });
    // now await for both promises to fulfill
    // result of the await is an array containing 2 arrays one for tags and one for stores 
    // destructure them to get the individual arrays(es6)
    const [tags,stores] = await Promise.all([ tagsPromise,storesPromise ]);

    res.render('tags',{ tags ,stores, currentTag, title:'Tags'});
}

exports.searchStores = async (req,res)=>{
    // using the index instead of searching name and description to search if it includes query
    const stores = await Store
    .find({
        //https://docs.mongodb.com/manual/reference/operator/query/text/#op._S_text
        $text:{ // $text allows us to search for text and the name and description fields are stored as text
            $search:req.query.q// search for the query param
        }
    },{ // initial search is simple and returns data based ion the created date , does not sort on 
        // ranking or closeness , using metadata to project(add) a field 'score' to do the sorting.
        score:{
            $meta:'textScore' // give score on the basis of relevance of text . coffee -> give coffee shop more
                            // score than a bar also serving coffee 
        }
    })
    // adding sort function to sort in the basis of score field added above , so that most relevent comes first
    .sort({
        score:{
            $meta:'textScore'
        }
    })
    // limit to limit the result to 5 relevent stores insearch bar
    .limit(5);

    res.json(stores);
};

// map stores will take a lat and a long and give stores near that
exports.mapStores = async (req,res)=>{
    // mongodb expects lat and long in array of numbers
    // the req params are strings parse them to float
    const coordinates = [req.query.lng,req.query.lat].map(parseFloat);
    // query to find the stores near the given coordinates
    const query ={
        // run query on location param in store
        location:{
            // $near finds points near the given coordinate , starting from nearest to farthest
            $near:{
                // defines the geoJson object , here the type is a single point can be a polygon etc
                // pass the coordinates to search near the area
                $geometry:{
                    type:'Point',
                    coordinates
                },
            // maxDistance gives how far should the query look for in meters
            $maxDistance:10000    // 10km
            }
        }
    };
    // .select allows to select/project the fields that should be returned as the result of the query
    // if a field does not exist it will not show
    // to exclude a field add '-' before it , -author 
    // but only one "Projection cannot have a mix of inclusion and exclusion.""
    const stores = await Store
                        .find(query)
                        .select('name description slug photo location')
                        .limit(parseInt(req.query.limit));
    
    res.json(stores);
};