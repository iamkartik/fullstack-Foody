// exports is a global variable 
// whatever follows exports can be imported in another file
const mongoose = require('mongoose');
// Store is already imported in start.js
// now is available to mongoose 
const Store = mongoose.model('Store');


// index page render
exports.homePage = (req,res)=>{
    res.render('index');
};

// render the add store page
exports.addStore = (req,res)=>{
    // use edit store to add/edit store
    res.render('editStore',{title:'Add a new Store !'});
};

exports.createStore = async (req,res)=>{
    // because we are using a strict schema 
    // any other params in req.body will be rejected
    // we need slug info that is auto generated
    // .save() actual saves the data
    const store = await (new Store(req.body)).save();
    // use flash to flash a message, flash added to req in app.js
    // flash takes 2 params type , msg , flashes will happen on the next req that comes to the server
    req.flash('success',`You have successfully added ${store.name} !`); 
    res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req,res)=>{
    // get all stores
    const stores =await Store.find();
    // if property name equals the value name ,no need to pass the key explicitly
    res.render('stores',{title:'Stores',stores});
}

exports.editStore = async (req,res)=>{
    // get the store with the id , id in req.params(in url)
    const store = await Store.findOne({ _id:req.params.id });
    // TODO::confirm they are the owners
    // store key is not required
    res.render('editStore',{title:`Edit ${store.name}`,store});
}

exports.updateStore = async (req,res)=>{
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