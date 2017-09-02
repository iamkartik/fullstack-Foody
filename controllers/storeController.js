// exports is a global variable 
// whatever follows exports can be imported in another file

// index page render
exports.homePage = (req,res)=>{
    res.render('index',{name:req.name,age:req.age});
};

// render the add store page
exports.addStore = (req,res)=>{
    // use edit store to add/edit store
    res.render('editStore',{title:'Add a new Store !'});
};

exports.createStore = (req,res)=>{
    res.json(req.body);
}