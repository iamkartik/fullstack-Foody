// exports is a global variable 
// whatever follows exports can be imported in another file

// writing a custom middleware
exports.myMiddleware = (req,res,next)=>{
    req.name = 'Kartik Sharma';
    // next calls the next function in order of execution
    next();
};


exports.myMiddleware2 = (req,res,next)=>{
    req.age = '26';
    // next calls the next function in order of execution
    next();
};

exports.homePage = (req,res)=>{
    res.render('index',{name:req.name,age:req.age});
};