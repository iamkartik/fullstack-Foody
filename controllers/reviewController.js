const mongoose = require('mongoose');
const Review = mongoose.model('Review');


exports.addReview = async (req,res)=>{
    // add the author field
    req.body.author = req.user._id;
    // add the store field from url
    req.body.store = req.params.id;
    // save to db
    const newReview = new Review(req.body);
    await newReview.save();
    // redirect
    req.flash('success','Review added successfully !');
    res.redirect('back');    
};