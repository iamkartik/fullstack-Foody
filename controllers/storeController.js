// exports is a global variable 
// whatever follows exports can be imported in another file
const mongoose = require('mongoose');
// Store is already imported in start.js
// now is available to mongoose 
const Store = mongoose.model('Store');


// index page render
exports.homePage = (req,res)=>{
    res.render('index',{name:req.name,age:req.age});
};

// render the add store page
exports.addStore = (req,res)=>{
    // use edit store to add/edit store
    res.render('editStore',{title:'Add a new Store !'});
};

exports.createStore = async (req,res)=>{
    // because we are using a strict schema 
    // any other params in req.body will be rejected
    const store = new Store(req.body);
    await store.save();
    res.redirect('/');
}